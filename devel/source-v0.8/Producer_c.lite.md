Producer C
===========

The `producer` module extends Grammar classes, adding a `produce()` method 
to generate target code for the node.

The compiler calls the `.produce()` method of the root 'Module' node 
in order to return the compiled code for the entire tree.

We extend the Grammar classes, so this module require the `Grammar` module.

    import 
      Project
      ASTBase, Grammar, NameDeclaration,  Lexer
      Environment, log

"C" Producer Functions
==========================

module vars  

    #store info to create a dispatcher for each method name (globally)
    var allDispatchersNameDecl = new NameDeclaration
    public var dispatcherModule: Grammar.Module

    # list of classes, to call __registerclass
    var classes: Grammar.ClassDeclaration array = []

    # USER_CLASSES_START_ID = 3 (NO_CLASS=0, Object=1, Class=2) + __CORE_CLASSES_INFO_LENGTH=3
    # must be kept in sync with hand-coded LiteC-core.c
    var USER_CLASSES_START_ID = 6

### Append to class NameDeclaration ###
      properties
        funcDecl: Grammar.FunctionDeclaration #pointer on dispatcherModule's each case


### Public function preProduction(project)

        // user class ID's start 
        ASTBase.setUniqueID 'CLASS',USER_CLASSES_START_ID

### Public function postProduction(project)

create _dispatcher.c & .h

        dispatcherModule = new Grammar.Module(project)
        declare valid project.options
        dispatcherModule.lexer = new Lexer(null, project, project.options)

        project.redirectOutput dispatcherModule.lexer.out // all Lexers now out here        

        dispatcherModule.fileInfo = Environment.fileInfoNewFile("_dispatcher",project.options)
        dispatcherModule.produceDispatcher

        resultLines =  dispatcherModule.lexer.out.getResult() //get .c file contents
        if resultLines.length
            Environment.externalCacheSave dispatcherModule.fileInfo.outFilename,resultLines

        var resultLines:string array =  dispatcherModule.lexer.out.getResult(1) //get .h file contents
        if resultLines.length
            Environment.externalCacheSave dispatcherModule.fileInfo.outFilename.slice(0,-1)+'h',resultLines

        log.message "#{log.color.green}[OK] -> #{dispatcherModule.fileInfo.outRelFilename} #{log.color.normal}"
        log.extra #blank line

    end function

### Append to class Grammar.Module ###

#### method produceDispatcher()

        var requiredHeaders: Grammar.Module array = []

_dispatcher.c

        .out '#include "LiteC-core.h"',NL
        .out '#include "_dispatcher.h"',NL,NL,NL,NL

LiteC__init function

        .out 'void LiteC__init(){',NL,NL,NL

        .out '    LiteC_registerCoreClasses();',NL
        .out '    if (CLASSES_ARRAY.length!=',USER_CLASSES_START_ID,') fatal("CHECK USER_CLASSES_START_ID on LiteC compiler");',NL,NL

register user classes

        for each classDeclaration in classes
            .out '    __registerClass('
                ,'"',classDeclaration.name,'", ' 
                ,classDeclaration.varRefSuper or 'Object__CLASS',', ' 
                ,classDeclaration.name,'__init',', '
                ,'sizeof(struct ',classDeclaration.name,'));',NL
              

        .out NL,'};',NL,NL

now all method dispatchers

        .out {COMMENT: 'method dispatchers'},NL,NL
        for each dispatcherNameDecl in map allDispatchersNameDecl.members
            with dispatcherNameDecl.funcDecl

                .out 'void* ', .name
                .produceParameters 'void*' //type for implicit parameter "this"
                .out "{",NL
                .out "    switch(((Object)this)->class){",NL
                
                for each caseNameDecl in map dispatcherNameDecl.members
                    with caseNameDecl.funcDecl
                        .out "      case ",caseNameDecl.name,"__CLASS:",NL
                        // call specific class_method
                        .out "         return ",caseNameDecl.name,"__",.name,"(this"
                        // passs same parameters, same order as dispatcher
                        // C-compiler should optimize this tail-call to a JMP instead of CALL
                        if .paramsDeclarations.length
                            for each varDecl in .paramsDeclarations
                                .out ',',varDecl.name
                        .out ");",NL,NL

                        // keep a list of required Headers
                        var classModule = .getParent(Grammar.Module)
                        if classModule not in requiredHeaders
                            requiredHeaders.push classModule

                end for each case

                .out "    };",NL
                .out "};",NL,NL

        end for each dispatcher (method name)

_dispatcher.h

        .out {h:1},NL
        
        .out '#ifndef #{.fileInfo.basename.toUpperCase()}_H',NL
        .out '#define #{.fileInfo.basename.toUpperCase()}_H',NL,NL

include requiredHeaders from classes used in the dispatcher
  
        for each moduleDecl in requiredHeaders
            .out '#include "#{moduleDecl.fileInfo.outRelFilename.slice(0,-1)}h"',NL

LiteC__init extern declaration

        .out NL,{COMMENT: 'LIBRARY INIT'},NL
        .out 'extern void LiteC__init();',NL,NL

methods dispatchers extern declaration

        .out {COMMENT: 'method dispatchers'},NL,NL

        for each dispatcherNameDecl in map allDispatchersNameDecl.members
          with dispatcherNameDecl.funcDecl
            .out 'extern void* ',.name
            .produceParameters 'void*' //type for implicit parameter "this"
            .out ";",NL

        .out NL,NL,"#endif",NL,NL


#### method produce()

if a 'export default' was declared, set the referenced namespace 
as the new 'export default' (instead of 'module.exports')

        var exportsName = '_Module_#{.name}_exports'
        .lexer.out.exportNamespace = exportsName
        if .exportDefault instance of Grammar.VarStatement
            declare valid .exportDefault.list.length
            declare valid .exportDefault.throwError
            if .exportDefault.list.length > 1, .exportDefault.throwError "only one var:Object alllowed for 'export default'"
            .lexer.out.exportNamespace = .exportDefault.list[0].name

        else if .exportDefault instance of ASTBase
            declare valid .exportDefault.name
            .lexer.out.exportNamespace = .exportDefault.name

        end if

default #includes:
"LiteC-core.h" at the header, the header at the .c

        .out {h:1},NL
        .out '#ifndef #{.fileInfo.basename.toUpperCase()}_H',NL
        .out '#define #{.fileInfo.basename.toUpperCase()}_H',NL,NL

        .out '#include "LiteC-core.h"',NL

        .out {h:0},NL
        .out '#include "#{.fileInfo.basename}.h"',NL,NL

        for each statement in .statements
          statement.produce()
        .out NL

        //add end of file comments
        .outPrevLinesComments .lexer.infoLines.length-1

export 'export default' namespace, if it was set.

        //if not .lexer.out.browser
        //    if .lexer.out.exportNamespace isnt exportsName
        //        .out exportsName,'=',.lexer.out.exportNamespace,";",NL

close .h #ifdef

        .out NL
        .out {h:1},NL
        .out '#endif',NL

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

        if .statement isnt instance of Grammar.SingleLineStatement
          .lexer.out.ensureNewLine

if there are one or more 'into var x' in a expression in this statement, 
declare vars before statement (exclude body of FunctionDeclaration)
Note: producer_js uses: callOnSubTree

        #ifdef TARGET_C
        for each child in .children where child.constructor isnt Grammar.Body
            declare valid child.declareIntoVar
            child.declareIntoVar
        #else
        this.callOnSubTree "declareIntoVar",Grammar.Body
        #endif

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
            .out "throw _new(Error(", .expr,"))"
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
        if .varRef.executes, return #if varRef already executes, nothing more to do
        .out "()" #add (), so JS executes the function call


### append to class Grammar.Operand ###

`Operand:
  |NumberLiteral|StringLiteral|RegExpLiteral
  |ParenExpression|ArrayLiteral|ObjectLiteral|FunctionDeclaration
  |VariableRef

A `Operand` is the left or right part of a binary oper
or the only Operand of a unary oper.

      method produce()

        if .name instance of Grammar.StringLiteral
            declare .name:Grammar.StringLiteral
            // in C we only have "" to define strings, '' are for char constants
            // if the StringLiteral is defined with '', change to "" and escape all internal \"
            var strValue:string = .name.name
            if strValue[0] is "'"
                strValue = .name.getValue() // w/o quotes
                strValue = strValue.replace(/"/g,'\\"') // escape internal \"
                strValue = '"'+strValue+'"' // enclose in ""

            if strValue is '""' 
                .out "EMPTY_STR"
            else
                .out strValue

            .out .accessors

        else        
            .out .name, .accessors
        end if

      #end Operand


### append to class Grammar.UnaryOper ###

`UnaryOper: ('-'|new|type of|not|no|bitwise not) `

A Unary Oper is an operator acting on a single operand.
Unary Oper inherits from Oper, so both are `instance of Oper`

Examples:
1) `not`     *boolean negation*     `if not a is b`
2) `-`       *numeric unary minus*  `-(4+3)`
3) `new`     *instantiation*        `x = new classNumber[2]`
4) `type of` *type name access*     `type of x is classNumber[2]` 
5) `no`      *'falsey' check*       `if no options then options={}` 
6) `~`       *bit-unary-negation*   `a = ~xC0 + 5`

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
                oper = '!='

else -if NEGATED- we add `!( )` to the expression

            else 
                prepend ="!("
                append=")"

Check for special cases: 

1) 'in' operator, requires swapping left and right operands and to use `.indexOf(...)>=0`
example: `x in [1,2,3]` -> `_indexOf(x,_literalArray(1,2,3))>=0`
example: `x not in [1,2,3]` -> `_indexOf(x,_literalArray(1,2,3))==-1`
example: `char not in myString` -> `_indexOf(char,myString)==-1`

        if .name is 'in'
            .out "_indexOf(",.left,",",.right,")", .negated? "==-1" : ">=0"

2) *'has property'* operator, requires swapping left and right operands and to use js: `in`

        else if .name is 'has property'
            .out prepend, "_hasProperty(",.right,",",.left,")",append

3) *'into'* operator (assignment-expression), requires swapping left and right operands and to use: `=`

        else if .name is 'into'
            .out "(",.right,"=",.left,")"

4) *'like'* operator (RegExp.test), requires swapping left and right operands and to use js: `.test()`

        else if .name is 'like'
            .out prepend,"_regepx_test(",.left,",",.right,")",append

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

Prefix ++/--, varName, Accessors and postfix ++/--

        .out .preIncDec, .varRefToArray(), .postIncDec


      helper method varRefToArray(upto:Number) returns Object array

          var lastPropAcess = 0
          var result = [.name]
          if .accessors
              for each inx,ac in .accessors
                  if upto>=0 and inx is upto, break
                  if ac instanceof Grammar.FunctionAccess 
                      if inx-1 is lastPropAcess  //method call
                          var methodName = result.pop()
                          result.pop() # remove "->"
                          result.unshift "#{methodName}(" //put "methodname(" first - call to dispatcher
                          #now at result, we have the instance reference, it stays as value for method's "this"
                          result.push ',' // add comma and other method's call args
                          result.push {CSL:ac.args} // add method args
                          result.push ')'
                      else
                          // simple fn call (no object method)
                          result.push '(',{CSL:ac.args},')' // add method args

                  else if ac instanceof Grammar.PropertyAccess // prop access
                      result.push '->'
                      result.push ac.name
                      lastPropAcess = inx

                  else if ac instanceof Grammar.IndexAccess
                      result.push '->item['
                      result.push ac.name //expression
                      result.push ']'

          return result

      end helper method


      helper method getInstanceAccessors() returns Object array

This method will get all the accessors up to a method call
returns an array, to send to .out

        var upto = 0
        if .accessors
          // search from the end of the accessor chain, upto the function call
          upto = .accessors.length
          while --upto>=0
              if .accessors[upto] instanceof Grammar.FunctionAccess
                //found the function call ()
                upto-- //move one back
                if .accessors[upto] instanceof Grammar.PropertyAccess
                    //is the function name, remove it to get the instance
                    upto-- //move one back
          end while

        return .varRefToArray(upto) //prop chain upto instance on which the function is called

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

          .out "_defaultObject(&",main,");",NL

          for each nameValue in objectLiteral.items
            var itemFullName = [main,'.',nameValue.name]
            .process(itemFullName, nameValue.value)


    #end helper recursive functions


-----------
## Accessors
1) Property access "." translates to pointer dereference "->"
2) Function access "()", if it's a method, we must add "->call" to access
the class jmp table. Also we must add the object as first parameter (this)
3) IndexAccess: we use C's built in `[ ]` accessor

### append to class Grammar.PropertyAccess ##
      method produce() 
        .out "->",.name

### append to class Grammar.FunctionAccess
      method produce() 
        declare .parent:Grammar.VariableRef
        if .parent.accessors[0] is this //simple function call
            .out "("
        else
            //member?
            .out "->call("
            .out .parent.getInstanceAccessors(),", " //value for "this" param
        end if
        .out {CSL:.args},")"

### append to class Grammar.IndexAccess
      method produce() 
        .out "[",.name,"]"

-----------

### Append to class ASTBase
#### helper method lastLineInxOf(list:ASTBase array) 

More Helper methods, get max line of list

        var lastLine = .lineInx
        for each item in list
            if item.lineInx>lastLine 
              lastLine = item.lineInx

        return lastLine


#### method getOwnerPrefix() returns string

check if we're inside a ClassDeclaration or AppendToDeclaration.
return prefix for item to be appended

        var parent = .getParent(Grammar.ClassDeclaration)

        if no parent, return 
    
        var ownerName, toPrototype
        if parent instance of Grammar.AppendToDeclaration
          #append to class prototype or object
          declare parent:Grammar.AppendToDeclaration
          toPrototype = not parent.toNamespace
          ownerName = parent.varRef.toString()
        
        else # in a ClassDeclaration
          declare valid .toNamespace
          toPrototype = true
          ownerName = parent.name

        //return [ownerName, toPrototype? "->prototype->" else "->" ]
        return ownerName


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

'properties' followed by a list of comma separated: var names and optional assignment

      method produce() 

        //.outLinesAsComment .lineInx, .lastLineInxOf(.list)

        //if no prefix, prefix = .getOwnerPrefix()

        for each varDecl in .list
          .out varDecl,";",NL
/*          if varDecl.assignedValue #is not valid to assign to .prototype. - creates subtle errors later
            if prefix instance of Array and prefix[1] and prefix[1] isnt '.', .throwError 'cannot assign values to instance properties in "Append to"'
            .out '    ',prefix, varDecl.name,"=",varDecl.assignedValue,";",NL
*/
        .skipSemiColon = true

### Append to class Grammar.VarStatement ###

'var' followed by a list of comma separated: var names and optional assignment

      method produce() 

        declare valid .compilerVar
        declare valid .export

        /*
        if .keyword is 'let' and .compilerVar('ES6')
          .out 'let '

        else
          .out 'var '
        */

Now, after 'var' or 'let' out one or more comma separated VariableDecl 
  
        .out {CSL:.list, freeForm:.list.length>2}

If 'var' was adjectivated 'export', add to exportNamespace

        if not .lexer.out.browser
  
          if .export and not .default
            .out ";", NL,{COMMENT:'export'},NL
            for each varDecl in .list
                .out .lexer.out.exportNamespace,'.',varDecl.name,' = ', varDecl.name, ";", NL
            .skipSemiColon = true



### Append to class Grammar.ImportStatement ###

'import' followed by a list of comma separated: var names and optional assignment

      method produce() 

        for each item:Grammar.ImportStatementItem in .list
          var requireParam = item.importParameter? item.importParameter.getValue() else item.name 
          .out '#include "', requireParam, '.h"', NL

        .skipSemiColon = true


### Append to class Grammar.VariableDecl ###

variable name and optionally assign a value

      method produce() 

It's a `var` keyword or we're declaring function parameters.
In any case starts with the variable name
      
          if no .nameDecl, .sayErr "INTERNAL ERROR: var '#{.name}' has no .nameDecl"
          var typeNameDecl = .nameDecl.findMember("**proto**")
          var typeStr
          if no typeNameDecl
              //.sayErr "can't determine type for var '#{.name}'"
              // if no explicit type assume "any"
              typeStr = 'any'
          else
              typeStr = typeNameDecl.name
              if typeNameDecl.name is 'prototype'
                  var parentName = typeNameDecl.parent.name
                  typeStr = parentName is 'String'?'str' else "#{parentName}_ptr";
              end if
              
          .out typeStr ,' ', .name

          declare valid .keyword

If this VariableDecl come from a 'var' statement, we force assignment (to avoid subtle bugs,
in LiteScript, 'var' declaration assigns 'undefined')

          //if .parent instanceof Grammar.VarStatement and .assignedValue
          //    .out ' = ',.assignedValue 

else, this VariableDecl come from function parameters decl, 
if it has AssginedValue, we out assignment if ES6 is available. 
(ES6 implements 'default' for parameters, so `function myFunc(a=3)` is valid in ES6)

          //else
          //  if .assignedValue and .compilerVar('ES6')
          //      .out ' = ',.assignedValue

    #end VariableDecl


### Append to class Grammar.SingleLineStatement ###

      method produce()
    
        var bare=[]
        for each statement in .statements
            bare.push statement.statement
        #.out NL,"    ",{CSL:bare, separator:";"}
        .out "{",{CSL:bare, separator:";"},";","}"


### Append to class Grammar.IfStatement ###

      method produce() 

        declare valid .elseStatement.produce

        if .body instanceof Grammar.SingleLineStatement
            .out "if (", .conditional,") ",.body
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

        declare valid .variant.produce
        .variant.produce()

Since al 3 cases are closed with '}; //comment', we skip statement semicolon

        .skipSemiColon = true


### Append to class Grammar.ForEachProperty
### Variant 1) 'for each property' to loop over *object property names* 

`ForEachProperty: for each [own] property name-VariableDecl in object-VariableRef`

      method produce() 

        .sayErr "'for each property' not supported for C production"
        /*
        //declare valid iterable.root.name.hasSideEffects
        //if iterable.operandCount>1 or iterable.root.name.hasSideEffects or iterable.root.name instanceof Grammar.Literal
          var listName:string = ASTBase.getUniqueVarName('list')  #unique temp listName var name
          .out "any * ",listName,"=",.iterable,"->base;",NL

          if .mainVar
            .out "var ", .mainVar.name,"=undefined;",NL

          .out "for ( var ", .indexVar.name, " in ", listName, ")"

          if .ownOnly
              .out "if (",listName,".hasOwnProperty(",.indexVar,"))"

          if .mainVar
              .body.out "{", .mainVar.name,"=",listName,"[",.indexVar,"];",NL

          .out .where

          .body.out "{", .body, "}",NL

          if .mainVar
            .body.out NL, "}"

          .out {COMMENT:"end for each property"},NL
        */

### Append to class Grammar.ForEachInArray
### Variant 2) 'for each index' to loop over *Array indexes and items*

`ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef`

      method produce()

Create a default index var name if none was provided

        var listName
        declare valid .iterable.root.name.hasSideEffects
        if .iterable.operandCount>1 or .iterable.root.name.hasSideEffects or .iterable.root.name instanceof Grammar.Literal
            listName = ASTBase.getUniqueVarName('list')  #unique temp listName var name
            .out "Array_ptr ",listName,"=",.iterable,";",NL
        else
            listName = .iterable

        if .isMap, .out "any ",.indexVar,";",NL
        .out "any ",.mainVar.name,";",NL

        var intIndexVarName
        if no .indexVar or .isMap
          intIndexVarName = {name:.mainVar.name+'__inx', assignedValue:0} #default index var name
        else
          intIndexVarName = .indexVar

        .out "for(int "
                , intIndexVarName,"=",.indexVar.assignedValue or "0"
                ," ; ",intIndexVarName,"<",listName,"->length"
                ," ; ",intIndexVarName,"++){"

        if .isMap
            .body.out .indexVar,"=",listName,"->base[",intIndexVarName,"]->key;",NL
            .body.out .mainVar.name,"=",listName,"->base[",intIndexVarName,"]->value;",NL
        else
            #Array
            .body.out .mainVar.name,"=",listName,"->base[",intIndexVarName,"];",NL

        if .where 
          .out .where,"{",.body,"}"
        else 
          .out .body

        .out "};",{COMMENT:["end for each in ",.iterable]},NL

### Append to class Grammar.ForIndexNumeric
### Variant 3) 'for index=...' to create *numeric loops* 

`ForIndexNumeric: for index-VariableDecl "=" start-Expression [,|;] (while|until) condition-Expression [(,|;) increment-Statement]`

Examples: `for n=0 while n<10`, `for n=0 to 9`
Handle by using a js/C standard for(;;){} loop

      method produce(iterable)

        declare valid .endExpression.produce

        .out "for(int ",.indexVar.name, "=", .indexVar.assignedValue or "0", "; "

        if .conditionPrefix is 'to'
            #'for n=0 to 10' -> for(n=0;n<=10;...
            .out .indexVar.name,"<=",.endExpression

        else # is while|until

produce the condition, negated if the prefix is 'until'

          #for n=0, while n<arr.length  -> for(n=0;n<arr.length;...
          #for n=0, until n >= arr.length  -> for(n=0;!(n>=arr.length);...
          .endExpression.produce( {negated: .conditionPrefix is 'until' })

        .out "; "

if no increment specified, the default is indexVar++

        .out .increment or [.indexVar.name,"++"]

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

### Append to class Grammar.ObjectLiteral ###

A `ObjectLiteral` is an object definition using key/value pairs like `{a:1,b:2}`. 
JavaScript supports this syntax, so we just pass it through. 

      method produce()
        .out "{",{CSL:.items},"}"

### Append to class Grammar.FreeObjectLiteral ###

A `FreeObjectLiteral` is an object definition using key/value pairs, but in free-form
(one NameValuePair per line, indented, comma is optional)

      method produce()
        .out "{",{CSL:.items, freeForm:true},"}"


### Append to class Grammar.FunctionDeclaration ###

`FunctionDeclaration: '[export][generator] (function|method|constructor) [name] '(' FunctionParameterDecl* ')' Block`

`FunctionDeclaration`s are function definitions. 

`export` prefix causes the function to be included in `module.exports`
`generator` prefix marks a 'generator' function that can be paused by `yield` (js/ES6 function*)

     method produce()

      var generatorMark = .generator and .compilerVar('ES6')? "*" else ""
      var isConstructor = this instance of Grammar.ConstructorDeclaration
      var addThis = false
      var ownerClass: Grammar.ClassDeclaration
      var className: string

check if this is a 'constructor', 'method' or 'function'

      if isConstructor
          .out "//class _init fn",NL
          ownerClass = .getParent(Grammar.ClassDeclaration)
          className = ownerClass.name
          .out "any ",className,"__init"
          addThis = true

else, method?

      else if this instance of Grammar.MethodDeclaration

          //if no options.typeSignature, .out "//function ",.name,NL
      
          #get owner where this method belongs to
          if no .getOwnerPrefix() into className 
              fail with 'method "#{.name}" Cannot determine owner object'

          #if shim, check before define
          //if .shim, .out "if (!",className,.name,")",NL

          //if .definePropItems #we should code Object.defineProperty
          //    className[1] = className[1].replace(/\.$/,"") #remove extra dot
          //    .out "Object.defineProperty(",NL,
          //          className, ",'",.name,"',{value:function",generatorMark
          //else
          .out .type or 'void',' '
          .out className,'__',.name 

          addThis = true

For C production, we're using a dispatcher for each method name

          // look in existing dispatchers
          if not allDispatchersNameDecl.findOwnMember(.name) into var dispatcherNameDecl 
              dispatcherNameDecl = allDispatchersNameDecl.addMember(.name)
              dispatcherNameDecl.funcDecl = this // first method found makes parameters model
          //create a case for the class in the dispatcher
          if dispatcherNameDecl.findOwnMember(className) 
              .throwError "DUPLICATED METHOD: a method named '#{.name}' already exists for class '#{className}'"
          var caseNameDecl = dispatcherNameDecl.addMember(className)
          #store a pointer to this FunctonDeclaration, to later code case call w parameters
          caseNameDecl.funcDecl = this 


else is a simple function

      else 
          .out .type or 'void',' ',.name

Now, funtion parameters

      .produceParameters className

if 'nice', produce default nice body, and then the generator header for real body

      /*
      var isNice = .nice and not (isConstructor or .shim or .definePropItems or .generator)
      if isNice
          var argsArray = (.paramsDeclarations or []).concat["__callback"]
          .out "(", {CSL:argsArray},"){", .getEOLComment(),NL
          .out '  nicegen(this, ',prefix,.name,"_generator, arguments);",NL
          .out "};",NL
          .out "function* ",prefix,.name,"_generator"
      end if
      */


start body

      .out "{", .getEOLComment()

      if no .body, .throwError 'function #{.name} has no body'

if is __init, assign initial values for properties

      if isConstructor 
          ownerClass.producePropertyAssignments

if simple-function, insert implicit return. Example: function square(x) = x*x

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
/* no on C
          if .paramsDeclarations and not .compilerVar('ES6')
              for each paramDecl in .paramsDeclarations
                if paramDecl.assignedValue 
                    .body.assignIfUndefined paramDecl.name, paramDecl.assignedValue
              #end for
          #end if
*/

now produce function body

          .body.produce()

close the function, add source map for function default "return undefined".

      .out "}"
      #ifdef PROD_C
      do nothing
      #else
      if .lexer.out.sourceMap
          .lexer.out.sourceMap.add ( .EndFnLineNum, 0, .lexer.out.lineNum-1, 0)
      #endif

if we were coding .definePropItems , close Object.defineProperty

/*
      if .definePropItems 
          for each definePropItem in .definePropItems 
            .out NL,",",definePropItem.name,":", definePropItem.negated? 'false':'true'
          end for
          .out NL,"})"
*/

If the function was adjectivated 'export/public', add to .h

      //if .export and not .default and this isnt instance of Grammar.ConstructorDeclaration
      if true and this isnt instance of Grammar.ConstructorDeclaration
          .out {h:1},NL
          .out "extern "
          if this is instance of Grammar.MethodDeclaration
              .out .type or 'void',' '
              .out className,'__',.name 
          else
              .out .type or 'void',' ',.name

          .produceParameters className

          .out ";",NL,{h:0}

#### method produceParameters(className)

if this is a class method, add "this" as first parameter

        var isConstructor = this is instance of Grammar.ConstructorDeclaration 
        if isConstructor
          or this is instance of Grammar.MethodDeclaration

            .out "(", (isConstructor?"any":"#{className}_ptr") ," this"
            if .paramsDeclarations.length
                .out ',',{CSL:.paramsDeclarations}
            .out ")"
        
        else
            //just function parameters declaration
            .out "(", {CSL:.paramsDeclarations}, ")" 



--------------------
### Append to class Grammar.PrintStatement ###
`print` is an alias for console.log

      method produce()

        var format:string array = []
        var callToString:boolean array = []

        for each inx,arg:Grammar.Expression in .args
            var nameDecl = arg.getResultType() 
            if no nameDecl
                .sayErr "print: can't determine type of expr ##{inx+1}: #{arg}"
            else if nameDecl.name is 'int'
                format.push "%d"
            else if nameDecl.name is 'float'
                format.push "%f"
            //else if nameDecl.name is 'str'
            //    format.push "%s"
            else if nameDecl.name is 'prototype'
                format.push "%s"
                callToString[inx]=true
            else
                .sayErr "don't know format code for type '#{nameDecl.composedName()}' of expr ##{inx+1}: #{arg}"
            end if
        end for

        .out 'printf("',format.join(' '),'",'
        for each inx,arg:Grammar.Expression in .args
            if callToString[inx]
                .out "toString(", arg, ")"
            else
                .out arg
        .out ')'

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

        if .global

          .out {h:1},NL

          for each item in .list
            .out '#include "',item.name,'.h"',NL

          .out {h:0},NL
         

        .outLinesAsComment .lineInx, .names? .lastLineInxOf(.names) : .lineInx
        .skipSemiColon = true


----------------------------
### Append to class Grammar.ClassDeclaration ###

Classes contain a code block with properties and methods definitions.

#### method produce()

1st, split body into: a) properties b) constructor c) methods

        declare theConstructor:Grammar.FunctionDeclaration
        declare valid .produce_AssignObjectProperties
        declare valid .export

        var theConstructor = null
        var theMethods: Grammar.Statement array = []
        var PropertiesDeclarationStatements = []

        if .body
          for each index,item in .body.statements

            if item.statement instanceof Grammar.ConstructorDeclaration 

              if theConstructor # what? more than one?
                .throwError('Two constructors declared for class #{.name}')

              theConstructor = item.statement

            else if item.statement instanceof Grammar.PropertiesDeclaration
               PropertiesDeclarationStatements.push item.statement

            else 
              theMethods.push item

        end if has .body

In C we create a struct for "instance properties" of each class

        .out {h:1},NL //start header output

        .out {COMMENT:"class"},.name
        if .varRefSuper
            .out ' extends ',.varRefSuper,NL
        else 
            .out NL

        // generate unique class id
        .out "#define #{.name}__CLASS ",ASTBase.getUniqueID('CLASS'),NL

        .out NL,"// declare:",NL
        .out "// #{.name}_ptr : type = ptr to instance",NL
        .out "typedef struct ",.name,"_s * ",.name,"_ptr;",NL
        .out "// struct #{.name}_s = struct with instance properties",NL
        .out "struct ",.name,"_s {",NL
        .out "    TypeID constructor;",NL
        for each propertiesDeclaration in PropertiesDeclarationStatements
            propertiesDeclaration.produce
        .out "};",NL,NL

export class__init (constructor)

        .out "extern any ",.name,"__init"
        if theConstructor
            theConstructor.produceParameters .name
        else 
            //default constructor
            .out "( any this)"
        end if
        .out ";",NL,NL

        .out {h:0},NL //end header output

        // keep a list of classes in each moudle, to out __registerClass
        classes.push this

      
Now on the .c file:

a) the __init constructor ( void function [name]__init)

        //.out {COMMENT:"constructor"},NL

        if theConstructor
            theConstructor.produce 
            .out ";",NL
        
        else // a default constructor
            .out "//default __init",NL
            .out "any ",.name,"__init(any this){"
            if .varRefSuper and .varRefSuper.toString() isnt 'Object'
                .out NL,"    ",{COMMENT:["//auto call super__init, to initialize first part of space at *this"]}
                .out NL,"    ",.varRefSuper,"__init(this);",NL

            //initialize properties with assigned values
            .producePropertyAssignments

            // en default constructor
            .out "};",NL

        end if


b) the methods

now out methods, which means create functions
named: class__fnName

        .out theMethods

If the class was adjectivated 'export', add to module.exports
      /*
        if not .lexer.out.browser
          if .export and not .default
            .out NL,{COMMENT:'export'},NL
            .out .lexer.out.exportNamespace,'.',.name,' = ', .name,';'
      */

        .out NL,{COMMENT:'end class '},.name,NL
        .skipSemiColon = true

#### method producePropertyAssignments

        if .body
          for each item in .body.statements
              if item.statement is instance of Grammar.PropertiesDeclaration
                declare item.statement:Grammar.PropertiesDeclaration
                //initialize properties with assigned values
                for each varDecl in item.statement.list where varDecl.assignedValue 
                    .out 'this->',varDecl.name,' = ', varDecl.assignedValue ,";",NL



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

### Append to class Grammar.TryCatch ###

      method produce() 

        .out 'try{', .body, .exceptionBlock

### Append to class Grammar.ExceptionBlock ###

      method produce() 

        .out NL,'}catch(',.catchVar,'){', .body, '}'

        if .finallyBody
          .out NL,'finally{', .finallyBody, '}'


### Append to class Grammar.SwitchStatement ###

      method produce()

if we have a varRef, is a switch over a value

        if .varRef

            .out 'switch(', .varRef, '){',NL,NL
            for each switchCase in .cases
                .out {pre:'case ', CSL:switchCase.expressions, post:':', separator:' '}
                .out switchCase.body
                switchCase.body.out 'break;',NL,NL

            if .defaultBody, .out 'default:',.defaultBody
            .out NL,'}'

else, it's a swtich over true-expression, we produce as chained if-else

        else

          for each index,switchCase in .cases
              .outLineAsComment switchCase.lineInx
              .out index>0? 'else ':'', 'if ('
              .out {pre:'(', CSL:switchCase.expressions, post:')', separator:'||'}
              .out '){'
              .out switchCase.body
              .out NL,'}'

          if .defaultBody, .out NL,'else {',.defaultBody,'}'


### Append to class Grammar.CaseWhenExpression ###

      method produce()

if we have a varRef, is a case over a value

        if .varRef

            var caseVar = ASTBase.getUniqueVarName('caseVar')
            .out '(function(',caseVar,'){',NL
            for each caseWhenSection in .cases
                caseWhenSection.out 'if('
                    ,{pre:'#{caseVar}==(',CSL:caseWhenSection.expressions, post:')', separator:'||'}
                    ,') return ',caseWhenSection.resultExpression,';',NL

            if .elseExpression, .out '    return ',.elseExpression,';',NL
            .out '        }(',.varRef,'))'

else, it's a var-less case. we code it as chained ternary operators

        else

          for each caseWhenSection in .cases
              .outLineAsComment caseWhenSection.lineInx
              caseWhenSection.out '(',caseWhenSection.booleanExpression,') ? (', caseWhenSection.resultExpression,') :',NL

          .out '/* else */ ',.elseExpression or 'undefined'


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


Identifier aliases
------------------

This are a few aliases to most used built-in identifiers:

    var IDENTIFIER_ALIASES =
      'on':         'true'
      'off':        'false'

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

      'type of':      'typeof'
      'instance of':  'instanceof'

      'is':           '=='
      'isnt':         '!='
      '<>':           '!='
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
            .out NL,{COMMENT:[name,": undefined",NL]}
            return

          .out NL,"//TO DO - default for ",name,'=',value,";"
          .out NL,"//if(",name,'==NULL) ',name,"=",value,";",NL


--------------------------------
