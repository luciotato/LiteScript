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
      Environment, log, color, Map

"C" Producer Functions
==========================

module vars  

    # list of classes, to call __registerclass
    var classes: Grammar.ClassDeclaration array = []

    # USER_CLASSES_START_ID 
    # must be kept in sync with hand-coded LiteC-core.c
    var USER_CLASSES_START_ID = 32

    #store info to create a dispatcher for each method name (globally)
    var allDispatchersNameDecl = new NameDeclaration
    public var dispatcherModule: Grammar.Module

    var DEFAULT_ARGUMENTS = "(any this, len_t argc, any* arguments)"

### Append to class NameDeclaration ###
      properties
        funcDecl: Grammar.FunctionDeclaration #pointer on dispatcherModule's each case


### Public function preProduction(project)

        // user class ID's start 
        ASTBase.setUniqueID 'TYPEID',USER_CLASSES_START_ID

### Public function postProduction(project)

create _dispatcher.c & .h

        dispatcherModule = new Grammar.Module(project)
        declare valid project.options
        dispatcherModule.lexer = new Lexer(null, project, project.options)

        project.redirectOutput dispatcherModule.lexer.out // all Lexers now out here        

        dispatcherModule.fileInfo = Environment.fileInfoNewFile("_dispatcher",project.options)
        dispatcherModule.produceDispatcher project

        resultLines =  dispatcherModule.lexer.out.getResult() //get .c file contents
        if resultLines.length
            Environment.externalCacheSave dispatcherModule.fileInfo.outFilename,resultLines

        var resultLines:string array =  dispatcherModule.lexer.out.getResult(1) //get .h file contents
        if resultLines.length
            Environment.externalCacheSave dispatcherModule.fileInfo.outFilename.slice(0,-1)+'h',resultLines

        log.message "#{color.green}[OK] -> #{dispatcherModule.fileInfo.outRelFilename} #{color.normal}"
        log.extra #blank line

    end function

    helper function normalizeDefine(name:string)
        return name.replace(/[\s\W]/g,"_").toUpperCase()


### Append to class Grammar.Module ###

#### method produceDispatcher(project)

        var requiredHeaders: Grammar.Module array = []

Add core-supported dispatchers & methods

"toString" have a default handler in core. It's added for any class

        .addMethodDispatcher 'toString'

        var supportedCoreMethods = new Map
        supportedCoreMethods.map_members = 
            String: ['slice', 'split', 'indexOf', 'lastIndexOf', 'concat'] //, 'substring', 'substr']
            Array: ['slice', 'splice', 'indexOf', 'lastIndexOf', 'push', 'unshift', 'pop', 'join', 'concat' ]
            Map: ['get', 'has', 'set', 'clear', 'delete']
            console: ['log', 'error']
            process: ['exit', 'cwd']

        for each className, methodNames:array in map supportedCoreMethods
            for each methodName in methodNames
                  .addMethodDispatcher methodName, className

_dispatcher.c

        .out '#include "_dispatcher.h"',NL,NL,NL,NL

core support and defined classes init function

        .out 'void __init_core_support(int argc, char** argv){',NL,NL,NL

        .out '    LiteC_registerCoreClasses(argc,argv);',NL

register user classes, init singletons

        for each classDeclaration in classes
            .out '    __registerClass('
                ,classDeclaration.name,'_TYPEID,'
                ,'"',classDeclaration.name,'", ' 

            if classDeclaration.varRefSuper 
                .out classDeclaration.varRefSuper,"_TYPEID"
            else 
                .out 'UNDEFINED',', ' 

            .out classDeclaration.name,'__init',', '
                ,'sizeof(struct ',classDeclaration.name,'_s));',NL

        .out NL
        for each classDeclaration in classes
            where classDeclaration instanceof Grammar.NamespaceDeclaration
                .out '    #{classDeclaration.name}__init_singleton();',NL
              
        .out NL,'};',NL,NL

now all method dispatchers

        .out {COMMENT: 'method dispatchers'},NL,NL
        for each dispatcherNameDecl in map allDispatchersNameDecl.members

            var methodName = dispatcherNameDecl.name
            .out 'any _', methodName, DEFAULT_ARGUMENTS
            //.produceParameters 'void*' //type for implicit parameter "this"
            .out "{",NL
            .out "    switch(this.type){",NL
            
            for each caseNameDecl in map dispatcherNameDecl.members
                .out "      case ",caseNameDecl.name,"_TYPEID:",NL
                // call specific class_method
                .out "         return ",caseNameDecl.name,"_",methodName,"(this,argc,arguments);",NL
                // passs same parameters, same order as dispatcher
                // C-compiler should optimize this tail-call to a JMP instead of CALL

                // keep a list of required Headers
                if caseNameDecl.funcDecl
                    var classModule = caseNameDecl.funcDecl.getParent(Grammar.Module)
                    if classModule not in requiredHeaders
                        requiredHeaders.push classModule

            end for each case

            .out NL,'      default:',NL
            if methodName is 'toString' //'toString' has "default" handler in core
                .out '         return _default_toString(this,argc,arguments);',NL
            else
                .out '         throw(_noMethod(this.type,"',methodName,'"));',NL

            .out "    };",NL
            .out "};",NL,NL

        end for each dispatcher (method name)

_dispatcher.h

        .out {h:1},NL
        
        .out '#ifndef #{normalizeDefine(.fileInfo.outRelFilename)}_H',NL
        .out '#define #{normalizeDefine(.fileInfo.outRelFilename)}_H',NL,NL

include LiteC-core

        .out '#include "LiteC-core.h"',NL

include headers for all the imported modules
  
        for each moduleNode:Grammar.Module in map project.moduleCache
            .out '#include "#{moduleNode.fileInfo.outRelFilename.slice(0,-1)}h"',NL

        //var project = .parent
        //.out '#include "#{project.main.fileInfo.outRelFilename.slice(0,-1)}h"',NL
        //for each moduleDecl in requiredHeaders
        //    .out '#include "#{moduleDecl.fileInfo.outRelFilename.slice(0,-1)}h"',NL

LiteC__init extern declaration

        .out NL,{COMMENT: 'core support and defined classes init'},NL
        .out 'extern void __init_core_support();',NL,NL

methods dispatchers extern declaration

        .out {COMMENT: 'method dispatchers'},NL,NL

        for each dispatcherNameDecl in map allDispatchersNameDecl.members
            .out 'extern any _',dispatcherNameDecl.name,"( DEFAULT_ARGUMENTS );",NL
            //.produceParameters 'void*' //type for implicit parameter "this"
            //.out ";",NL

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
        .out '#ifndef #{normalizeDefine(.fileInfo.outRelFilename)}_H',NL
        .out '#define #{normalizeDefine(.fileInfo.outRelFilename)}_H',NL,NL

        .out '#include "_dispatcher.h"',NL

        .out {h:0},NL
        .out '#include "#{.fileInfo.basename}.h"',NL,NL

if is main module,
First: all classes declarations, imports and declares
after that, we start "int main(){..."

        if .isMain 

            for each statement in .statements

                if statement.statement instanceof Grammar.VarStatement
                    declare statement.statement: Grammar.VarStatement
                    statement.statement.produceDeclare

                else if statement.isDeclaration()
                    statement.produce

            .out NL,NL,NL,"//-------------------------------",NL
            .out "int main(int argc, char** argv) {",NL
            .out "   __init_core_support(argc,argv); //see _dispatcher.c",NL

            for each statement in .statements 

                if statement.statement instanceof Grammar.VarStatement
                    declare statement.statement: Grammar.VarStatement
                    statement.statement.produceAssignments

                else if not statement.isDeclaration()
                    statement.produce

            //if not mainFunctionStarted, .throwError '"#{.fileInfo.outRelFilename}": no code found to create main function'
            .out NL,"}//end main function",NL

        else

            .out .statements

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
                Grammar.PropertiesDeclaration, Grammar.FunctionCall, Grammar.DoNothingStatement
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

helper function to determine if a statement is a declaration (can be outside a funcion in "C")
or a "statement" (must be inside a funcion in "C")

      helper method isDeclaration returns boolean

        return .statement is instance of Grammar.ClassDeclaration
            or .statement is instance of Grammar.FunctionDeclaration
            or .statement.constructor in [
                    Grammar.ImportStatement
                    Grammar.DeclareStatement
                    Grammar.CompilerStatement
                    ]


called above, pre-declare vars from 'into var x' assignment-expression

    append to class Grammar.Oper
      method declareIntoVar()
          if .intoVar
              .out "var ",.right,"=undefined;",NL


---------------------------------
### append to class Grammar.ThrowStatement ###

      method produce()
          if .specifier is 'fail'
            .out "throw(new(Error_TYPEID,1,(any_arr){",.expr,"}));"
          else
            .out "throw(",.expr,")"


### Append to class Grammar.ReturnStatement ###

      method produce()
        .out "return"
        if .expr, .out ' ',.expr


### Append to class Grammar.FunctionCall ###

      method produce() 

        var options=
            validations:[]

        var result = .varRef.calcReference(options)

        // assert not null or undefined before calling
        //for each validation in options.validations
        //    .out validation,NL

        // out function call
        .out result

        //if .varRef.executes, return #if varRef already executes, nothing more to do
        //.out "()" #add (), so JS executes the function call


### append to class Grammar.Operand ###

`Operand:
  |NumberLiteral|StringLiteral|RegExpLiteral
  |ParenExpression|ArrayLiteral|ObjectLiteral|FunctionDeclaration
  |VariableRef

A `Operand` is the left or right part of a binary oper
or the only Operand of a unary oper.

      properties
        produceType: string 

      method produce()

        var pre,post

        if .name instance of Grammar.StringLiteral
            declare .name:Grammar.StringLiteral
            // in C we only have "" to define strings, '' are for char constants
            // if the StringLiteral is defined with '', change to "" and escape all internal \"
            var strValue:string = .name.name
            if strValue[0] is "'"
                strValue = .name.getValue() // w/o quotes
                strValue = strValue.replace(/"/g,'\\"') // escape internal \"
                strValue = '"'+strValue+'"' // enclose in ""

            if .produceType is 'any'
                pre="any_str("
                post=")"

            if strValue is '""' 
                .out "any_EMPTY_STR"
            else
                .out pre,strValue,post

            .out .accessors

        else if .name instance of Grammar.NumberLiteral

            if .produceType is 'any'
                pre="any_number("
                post=")"

            .out pre,.name,post,.accessors

        else if .name instance of Grammar.VariableRef
            declare .name:Grammar.VariableRef
            .name.produceType = .produceType
            .out .name

        else //ParenExpression
            declare valid .name.produceType
            .name.produceType = .produceType
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

      properties
        produceType: string 

      method produce() 
        
        var translated = operTranslate(.name)
        var prepend,append

if it is "boolean not", add parentheses, because js has a different precedence for "boolean not"
-(prettier generated code) do not add () for simple "falsey" variable check

        if translated is "!" 
            if not (.name is "no" and .right.name instanceof Grammar.VariableRef)
                prepend ="("
                append=")"


        if translated is "new" and .right.name instance of Grammar.VariableRef
            declare .right.name:Grammar.VariableRef
            .out .right.name.calcReference({nameReplace:"new", typeID:.right.name.name})

        else
            var pre,post
            if .produceType is 'any'
                pre="any_number("
                post=")"

            .right.produceType = translated is "!"? 'Bool' else 'Number' //Except "!", unary opers require numbers

add a space if the unary operator is a word. Example `typeof`

            if /\w/.test(translated), translated+=" "

            .out pre, translated, prepend, .right, append, post


### append to class Grammar.Oper ###

      properties
          produceType: string

      method produce()

        var oper = .name

default mechanism to handle 'negated' operand

        var toAnyPre, toAnyPost
        if .produceType is 'any' 
            toAnyPre = 'any_number('
            toAnyPost = ")"

        var prepend,append
        if .negated # NEGATED

else -if NEGATED- we add `!( )` to the expression

                prepend ="!("
                append=")"

Check for special cases: 

1) 'in' operator, requires swapping left and right operands and to use `.indexOf(...)>=0`
example: `x in [1,2,3]` -> `indexOf(x,_literalArray(1,2,3))>=0`
example: `x not in [1,2,3]` -> `indexOf(x,_literalArray(1,2,3))==-1`
example: `char not in myString` -> `indexOf(char,myString)==-1`

        switch .name 
          case 'in':
            .out toAnyPre,"indexOf(",.left,",1,(any_arr){",.right,"}).value.number", .negated? "==-1" : ">=0",toAnyPost

2) *'has property'* operator, requires swapping left and right operands and to use js: `in`

          case 'has property':
            .out toAnyPre,"indexOf(",.right,",1,(any_arr){",.left,"}).value.number", .negated? "==-1" : ">=0",toAnyPost

3) *'into'* operator (assignment-expression), requires swapping left and right operands and to use: `=`

          case 'into':
            if .produceType and .produceType isnt 'any', .out 'anyTo',.produceType,'('
            .out "(",.right,"=",.left,")"
            if .produceType and .produceType isnt 'any', .out ')'

4) *'like'* operator (RegExp.test), requires swapping left and right operands and to use js: `.test()`

          case 'like':
            .out toAnyPre,prepend,'RegExp_test(',.left,',"',.right,'")',append,toAnyPost

5) equal comparisions require both any

          case 'is':
            .left.produceType = 'any'
            .right.produceType = 'any'
            .out .negated?'!':'', '__is(',.left,',',.right,')'

6) js's '||' operator returns first expression if it's true, second expression is first is false, 0 if both are false
   so it can be used to set a default value if first value is undefined,0,null or ""
   C's '||' operator, returns 1 (not the first expression itself, the expressions are lost)

          case 'or':
            .left.produceType = 'any'
            .right.produceType = 'any'
            .out '__or(',.left,',',.right,')'

else we have a direct translatable operator. 
We out: left,operator,right

          default

            var operC = operTranslate(oper) 
            
            switch operC

                case '?': // left is condition, right is: if_true
                    .left.produceType = 'Bool'
                    .right.produceType = .produceType

                case ':': // left is a?b, right is: if_false
                    .left.produceType = .produceType
                    .right.produceType = .produceType

                case '&&','||': // boolean opers
                    .left.produceType = 'Bool'
                    .right.produceType = 'Bool'

                default //default for binary opers: numbers
                    .left.produceType = 'Number'
                    .right.produceType = 'Number'

            if operC isnt '?' // cant put xx( a ? b )
                var extra, preExtra
                if .produceType is 'any' 
                    if .left.produceType is 'any' and .right.produceType is 'any'
                        do nothing
                    else
                        preExtra = 'any_number('
                        extra = ")"
                
                else if .produceType 
                    if ( .left.produceType is .produceType and .right.produceType is .produceType )
                        or ( .produceType is 'Bool' and .left.produceType is 'Number' and .right.produceType is 'Number' ) // numbers are valid bools
                        do nothing
                    else
                      preExtra = 'anyTo#{.produceType}('
                      extra = ")"

            .out preExtra, prepend, .left,' ', operC, ' ',.right, append, extra

        end case oper


### append to class Grammar.Expression ###

      properties
          produceType: string

      method produce(options) 

Produce the expression body, negated if options={negated:true}

        default options=
          negated: undefined

        default .produceType='any'

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

        declare valid .root.produceType
        .root.produceType = .produceType
        .out prepend, .root, append
        //.out preExtra, prepend, .root, append, extra


### helper function fixCReservedWord(methodName)

        // hack: fix some C's reserverd word usage
        switch methodName
            case 'exit': return 'exit_'
            case 'log': return 'log_'
            case 'error': return 'error_'

        return methodName

### append to class Grammar.VariableRef ###

`VariableRef: ['--'|'++'] IDENTIFIER [Accessors] ['--'|'++']`

`VariableRef` is a Variable Reference. 

 a VariableRef can include chained 'Accessors', which can:
 *access a property of the object : `.`-> PropertyAccess `[`->IndexAccess
 *assume the variable is a function and perform a function call :  `(`-> FunctionAccess

      properties
          produceType: string 
          isAny: boolean

      method produce() 

Prefix ++/--, varName, Accessors and postfix ++/--

        if .name is 'arguments'
            .out '_newArrayWith(argc,arguments)'
            return

        var result = .calcReference()

        var pre, post
        
        if .produceType is 'any' and not .isAny 
            pre = 'any_number('
            post = ')'
        
        else if .produceType and .produceType isnt 'any' and .isAny 
            pre = 'anyTo#{.produceType}('
            post = ')'

        .out pre, .preIncDec, result, .postIncDec, post

##### helper method calcReference(options) returns array of array

        var result: array = [] //array of arrays
        var partial: string

        default options=
            nameReplace: undefined
            typeID: undefined
            validations:[]

Start with main variable name, to check property names

        partial = options.nameReplace or 
                case .name 
                    when 'true' then 'any_TRUE'
                    when 'false' then 'any_FALSE'
                    else .name
                end

        result.push [fixCReservedWord(partial)]
        .isAny = true
        var actualVar = .tryGetFromScope(.name, {informError:true, isForward:true, isDummy:true})

        if no actualVar, .throwError("var '#{partial}' not found in scope")
        if actualVar.findOwnMember("**proto**") is '**nativeNumber**', .isAny=false

        if no .accessors, return result

now follow each accessor

        var avType:NameDeclaration

        for each inx,ac in .accessors
            declare valid ac.name

            if no actualVar
                .throwError("processing '#{partial}', cant follow property chain types")

for FunctionAccess

            if ac.constructor is Grammar.FunctionAccess

                partial +="(...)"
                .isAny = true

                if inx>1 and .accessors[inx-1].constructor isnt Grammar.PropertyAccess
                    .throwError("'#{partial}.call' or '.apply' must be used to call a function pointer stored on a variable")

                var prevNameArr:array = result.pop() //take fn name 

                var callParams:array
                if inx is 0 //first accessor is function access, this is a call to a global function
                    prevNameArr.push "(" //add "(" 
                    result.unshift prevNameArr // put "functioname" first - call to glboal function
                    callParams = [options.typeID? "#{options.typeID}_TYPEID": "NONE"] //"this=NONE when calling a global fn w/o instance
                else
                    //method call
                    prevNameArr.unshift "_" //add "_" to call dispatcher for this method
                    prevNameArr.push "(" //add "(" 
                    result.unshift prevNameArr // put "methodname(" first - call to dispatcher
                    callParams = result.pop() //take instance reference as 1st param (this)
                    options.validations.push ["assert("].concat(callParams,".type>TYPE_NULL);")

                //add arguments[] 
                if ac.args and ac.args.length
                    callParams.push ",#{ac.args.length},(any_arr){",{CSL:ac.args,freeForm:1},"}"
                else
                    callParams.push ",0,NULL"
                callParams.push ")"                    

                result.push callParams

                actualVar = actualVar.findMember('**return type**')
                #the actualVar is now function's return type'
                #and next property access should be on defined members of the return type

for PropertyAccess, we must apply AS(type...) to prev item

            else if ac instanceof Grammar.PropertyAccess

                if ac.name is '_typeID' //native int, part of any_s
                    result.push [".","type"]
                    .isAny=false

                else if ac.name is 'length' //hack, convert x.length in a funcion call, length(x)
                    result.unshift ['length','('] // put "length(" first - call to dispatcher
                    result.push [")"]
                    .isAny=false

                else if inx+1 < .accessors.length and .accessors[inx+1].constructor is Grammar.FunctionAccess
                    // next is function access,
                    // we do not need to derefence this as a pointer. Keep it as it is
                    result.push [fixCReservedWord(ac.name)]
                    .isAny = true

                else if ac.name is 'apply' or inx+2 < .accessors.length and .accessors[inx+1].constructor is Grammar.PropertyAccess
                    and .accessors[inx+1].name is 'apply'
                    // this is apply or next is .apply, call: _apply_function(function,this,args)
                    //hack: _apply
                    result.pop() //take method owner (remove)
                    var methodName
                    if ac.name is 'apply'
                        methodName = fixCReservedWord(.name) //main varref name, global fn
                    else
                        methodName = "_#{fixCReservedWord(ac.name)}" //a method call

                    var acApplyCall:Grammar.FunctionAccess = .accessors[inx+2]
                    if no acApplyCall.constructor is Grammar.FunctionAccess or no acApplyCall.args or acApplyCall.args.length isnt 2 
                        .sayErr "Expected 2 arguments after .apply, 'this' and 'arguments:array'"
                    else
                        result.push ["_apply_function(",methodName,",", acApplyCall.args[0],",",acApplyCall.args[1],")"]

                    inx+=2 //skip apply and "(this,args)"

                else

                    .isAny = true

                    var typeStr
                    avType = actualVar.findOwnMember('**proto**')
                    if no avType, avType = actualVar.findOwnMember('*namespace*')
                    if no avType
                        if inx is 0
                            typeStr = .name //let's assume singleton
                        else
                            .sayErr "Can not determine type of '#{partial}'. Can not code Property Access(.)"
                            return
                    else
                        #get type name
                        typeStr = avType.name
                        if typeStr is 'prototype'
                            typeStr = avType.parent.name
                        end if
                    end if

                    result.unshift ["((",typeStr,"_ptr)"]
                    prevNameArr = result.pop()
                    // Note: generate a complete typecast instead of using macro "AS(..)"
                    // to ease C code Netbeans GUI debugging (macro AS(..) can't be added as watch)
                    prevNameArr.push ".value.ptr)->"

                    result.push prevNameArr, [ac.name]

                end if // subtypes of propertyAccess

                partial +=".#{ac.name}"

                //get prop definition
                actualVar = .tryGetMember(actualVar, ac.name,{informError:true})

else, for IndexAccess, the varRef type is now 'name.value.item[...]'
and next property access should be on defined members of the type

            else if ac.constructor is Grammar.IndexAccess
                
                partial +="[...]"
                .isAny = true

                declare ac:Grammar.IndexAccess

                //add .value.item[...]
                var prevName:array = result.pop()

                //ac.name is Expression
                ac.name.produceType = 'Number'

                // w/o array bounds check:
                prevName.push ".value.arr->item[(len_t)",ac.name,"]" //ac.name is Expression
                
                // with array bounds check:
                //result.unshift ["__getItem","("]
                //prevName.push ",",ac.name,")" //ac.name is Expression

                result.push prevName

                actualVar = actualVar.findMember('**item type**')

            end if //type of accessor

            if actualVar instanceof Grammar.VariableRef
                declare actualVar:Grammar.VariableRef
                actualVar = actualVar.tryGetReference({informError:true, isForward:true, isDummy:true})

        end for #each accessor

        return result


      method getTypeName() returns string

          var avType = .tryGetReference({informError:true, isForward:true, isDummy:true})
          #get type name
          var typeStr = avType.name
          if typeStr is 'prototype'
              typeStr = avType.parent.name
          end if

          return typeStr

### append to class Grammar.AssignmentStatement ###

      method produce() 

        .out .lvalue, ' ', operTranslate(.name), ' ' 
        .out .rvalue


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
See: Grammar.VariableDecl

      method produce() 

        //.outLinesAsComment .lineInx, .lastLineInxOf(.list)

        .out 'any ',{CSL:.list},";"
        //for each varDecl in 
        //    .out varDecl,";",NL

/*
        var prefix

        // AppendToDeclaration extends NamespaceDeclaration extends ClassDeclaration 
        if .getParent(Grammar.NamespaceDeclaration) into var parent:Grammar.NamespaceDeclaration 
            // for NamespaceDeclaration and Append-to namespace, declare vars with prefix 
            if parent.toNamespace, prefix = .getOwnerPrefix()

        for each varDecl in .list
            varDecl.produce(prefix)
            .out ";",NL
*/

/*          if varDecl.assignedValue #is not valid to assign to .prototype. - creates subtle errors later
            if prefix instance of Array and prefix[1] and prefix[1] isnt '.', .throwError 'cannot assign values to instance properties in "Append to"'
            .out '    ',prefix, varDecl.name,"=",varDecl.assignedValue,";",NL
*/
        .skipSemiColon = true


### Append to class Grammar.VarDeclList ###

      method produceAssignments(className) 

        var count=0

        for each variableDecl in .list
            if count++ and no className, .out ", "
            variableDecl.produceAssignment className
            if className, .out ";",NL

        if count and no className, .out ";",NL

### Append to class Grammar.VarStatement ###

'var' followed by a list of comma separated: var names and optional assignment

      method produceDeclare() 
        .out 'var ',{CSL:.list},";",NL

      method produce() 

        declare valid .compilerVar
        declare valid .export

        /*
        if .keyword is 'let' and .compilerVar('ES6')
          .out 'let '

        else
          .out 'var '
        */

        .out 'var '

Now, after 'var' (alias for 'any') out one or more comma separated VariableDecl 
    
        .produceAssignments 

If 'var' was adjectivated 'export', add to exportNamespace

        /*
        if not .lexer.out.browser
  
              if .export and not .default
                .out ";", NL,{COMMENT:'export'},NL
                for each varDecl in .list
                    .out .lexer.out.exportNamespace,'.',varDecl.name,' = ', varDecl.name, ";", NL
                .skipSemiColon = true
        */


### Append to class Grammar.ImportStatement ###

'import' followed by a list of comma separated: var names and optional assignment

      method produce() 

        for each item in .list
            .out '#include "', item.getBaseFilename(), '.h"', NL

        .skipSemiColon = true


### Append to class Grammar.VariableDecl ###

variable name and optionally assign a value

      method produceAssignment(className) 

            if className, .out '((',className,'_ptr)this.value.ptr)->'
            .out .name,' = '

            if .assignedValue
                .out .assignedValue 
            else
                .out 'undefined'


      //method produce(options) 
      //      .out .name

          /*
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
          */


    #end VariableDecl


### Append to class Grammar.SingleLineStatement ###

      method produce()
    
        .out "{",{CSL:.statements, separator:";"},";","}"


### Append to class Grammar.IfStatement ###

      method produce() 

        declare valid .elseStatement.produce
        .conditional.produceType = 'Bool'
        .out "if (", .conditional,") "

        if .body instanceof Grammar.SingleLineStatement
            .out .body
        else
            .out " {", .getEOLComment()
            .out .body, "}"

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
            .out "any ",listName,"=",.iterable,";",NL
        else
            listName = .iterable

        var startValue = "0"
        var intIndexVarName
        if .indexVar 
            .out "any ",.indexVar,"=undefined;",NL
            intIndexVarName = .indexVar.name
            startValue = .indexVar.assignedValue or "0"
        else
            intIndexVarName = .mainVar.name+'__inx';

        .out "any ",.mainVar.name,"=undefined;",NL

        .out "for(int ", intIndexVarName,"=", startValue,
                  " ; ",intIndexVarName,"<",listName,".value.arr->length",
                  " ; ",intIndexVarName,"++){"

        if .isMap
            if .indexVar, .body.out .indexVar,"=",listName,".value.map->keys[",intIndexVarName,"];",NL
            .body.out .mainVar.name,"=",listName,".value.map->values[",intIndexVarName,"];",NL
        else
            #Array
            .body.out .mainVar.name,"=",listName,".value.arr->item[",intIndexVarName,"];",NL

        if .where 
          .out '  ',.where,"{",.body,"}"
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

        // indicate .indexVar is a native number, so no ".value.number" required to produce a number
        .indexVar.nameDecl.members.set '**proto**','**nativeNumber**'

        .indexVar.assignedValue.produceType='Number';

        .out "for(int64_t ", .indexVar.name,"=", .indexVar.assignedValue or "0","; "

        if .conditionPrefix is 'to'
            #'for n=0 to 10' -> for(n=0;n<=10;...
            .endExpression.produceType='Number';
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

        .expr.produceType = 'Bool'
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
        .out "//do nothing",NL

### Append to class Grammar.ParenExpression ###
A `ParenExpression` is just a normal expression surrounded by parentheses.

      properties
        produceType

      method produce() 
        .expr.produceType = .produceType
        .out "(",.expr,")"

### Append to class Grammar.ArrayLiteral ###

A `ArrayLiteral` is a definition of a list like `[1, a, 2+3]`. We just pass this through to JavaScript.

      method produce() 

        .out "_newArrayWith("
        
        if no .items or .items.length is 0
            .out "0,NULL"
        else
            // e.g.: LiteScript:   var list = [a,b,c]
            // e.g.: "C": any list = (any){Array_TYPEID,.value.arr=&(Array_s){3,.item=(any_arr){a,b,c}}};
            .out .items.length,",(any_arr){",{CSL:.items},"}"

        .out ")"

        /*else

            // e.g.: LiteScript:   var list = [a,b,c]
            // e.g.: "C": any list = (any){Array_TYPEID,.value.arr=&(Array_s){3,.item=(any_arr){a,b,c}}};

            .out "(any){Array_TYPEID,.value.arr=&(Array_s){#{.items.length},.item=(any_arr){",{CSL:.items},"}}}"
        */


### Append to class Grammar.NameValuePair ###

A `NameValuePair` is a single item in an object definition. Since we copy js for this, we pass this straight through 

      method produce() 
        .out .name,": ",.value

### Append to class Grammar.ObjectLiteral ###

A `ObjectLiteral` is an object definition using key/value pairs like `{a:1,b:2}`. 
JavaScript supports this syntax, so we just pass it through. 

      method produce()
        if no .items or .items.length is 0
            .out "_newMap(0,NULL)"
        else
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

##### method produce()

        var generatorMark = .hasAdjective('generator') and .compilerVar('ES6')? "*" else ""
        var isConstructor = this instance of Grammar.ConstructorDeclaration
        var addThis = false
        var ownerClass: Grammar.ClassDeclaration
        var className: string

check if this is a 'constructor', 'method' or 'function'

        if isConstructor
            .out "//class _init fn",NL
            ownerClass = .getParent(Grammar.ClassDeclaration)
            className = ownerClass.name
            .out "void ",className,"__init"
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
            //.out .type or 'void',' '
            .out 'any ',className,'_',fixCReservedWord(.name)

            addThis = true

For C production, we're using a dispatcher for each method name

            .addMethodDispatcher .name, className

else is a simple function

        else 
            //.out any [name]( any this, int argc, any * arguments )
            .out 'any ',' ',fixCReservedWord(.name)

Now, function parameters

        .out DEFAULT_ARGUMENTS
        //.produceParameters className

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

        if no .body, .throwError 'function #{.name} has no body'

        .body.out "{", .getEOLComment(), NL

        if className
            .body.out (
                NL,NL,"// validate this type",NL
                "assert(this.type==",className,"_TYPEID);",NL
                "//---------",NL
                )

        if .paramsDeclarations and .paramsDeclarations.length

                .body.out "// define named params",NL

                if .paramsDeclarations.length is 1
                    .body.out "var ",.paramsDeclarations[0].name,"= argc? arguments[0] : undefined;",NL

                else
                    var namedParams:array=[]

                    for each paramDecl in .paramsDeclarations
                        namedParams.push paramDecl.name

                    .body.out ( 
                        "var ",{CSL:namedParams},";",NL
                        namedParams.join("="),"=undefined;",NL
                        "switch(argc){",NL 
                        )

                    for inx=namedParams.length-1, while inx>=0, inx--
                        .body.out "  case #{inx+1}:#{namedParams[inx]}=arguments[#{inx}];",NL
                    
                    .body.out "}",NL

                end if
                .body.out "//---------",NL
        
        end if //named params
                      

if is __init, assign initial values for properties

        if isConstructor 
            ownerClass.producePropertyAssignments className

if simple-function, insert implicit return. Example: function square(x) = x*x

        if .body instance of Grammar.Expression
            .out "return ", .body

        else

if it has a "catch" or "exception", insert 'try{'

            for each statement in .body.statements
                if statement.statement instance of Grammar.ExceptionBlock
                    .body.out " try{",NL
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
                //.out .type or 'void',' '
                .out 'any ',className,'_',fixCReservedWord(.name )
            else
                .out 'any ',' ',fixCReservedWord(.name)

            //.produceParameters className
            .out "( DEFAULT_ARGUMENTS );",NL,{h:0}

    /*
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
    */


--------------------
### Append to class Grammar.PrintStatement ###
`print` is an alias for console.log

      method produce()

        if .args.length 
            .out 'console_log_(NONE,#{.args.length},(any_arr){',{CSL:.args},'})'
        else
            .out 'console_log_(NONE,0,NULL)'

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
### Append to class Grammar.ImportStatementItem ###

        method getBaseFilename return .importParameter?.importParameter.getValue():.name 

--------------------
### Append to class Grammar.DeclareStatement ###

Out as comments

      method produce()

        if .hasAdjective('global')

          .out {h:1},NL

          for each item in .list
            .out '#include "',item.getBaseFilename(),'.h"',NL

          .out {h:0},NL
         

        .outLinesAsComment .lineInx, .names? .lastLineInxOf(.names) : .lineInx
        .skipSemiColon = true


----------------------------
### Append to class Grammar.ClassDeclaration ###

Classes contain a code block with properties and methods definitions.

#### method produce()

1st, split body into: a) properties b) constructor c) methods

        log.debug "produce: #{.constructor.name} #{.name}"

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

        if .constructor is Grammar.NamespaceDeclaration

            //.out no .varRef.accessors? 'var ':'' ,.varRef,'={};'
            declare .name:string
            .name = .name.replace(/\./g,'_')

            .out 'any #{fixCReservedWord(.name)}={.type=0}; //declare singleton',NL,
                 'void #{.name}__init_singleton(){',NL,
                 '   if (!#{fixCReservedWord(.name)}.type) #{fixCReservedWord(.name)}=new(#{.name}_TYPEID,0,NULL);',NL,
                 '};',NL

            .out {h:1},NL, //start header output
                "//-------------------",NL,
                "//.namespace ", .name ,NL,
                'extern any #{fixCReservedWord(.name)}; //#{.name} is a singleton',NL,
                'void #{.name}__init_singleton();',NL,
                "//-------------------",NL

        else
            .out {h:1},NL //start header output
            .out {COMMENT:"class"},.name
            if .varRefSuper
                .out ' extends ',.varRefSuper,NL
            else 
                .out NL

        end if

        // generate unique class id
        .out "#define #{.name}_TYPEID ",ASTBase.getUniqueID('TYPEID'),NL

        //.out NL,"// declare:",NL
        //.out "// #{.name}_ptr : type = ptr to instance",NL
        .out "typedef struct ",.name,"_s * ",.name,"_ptr;",NL

        //.out "// struct #{.name}_s = struct with instance properties",NL
        .out "typedef struct ",.name,"_s {",NL
        for each propertiesDeclaration in PropertiesDeclarationStatements
            propertiesDeclaration.produce
        .out "} ",.name,"_s;",NL,NL

export class__init(), constructor

        .out "extern void ",.name,"__init", DEFAULT_ARGUMENTS,";"
        /*
        if theConstructor
            theConstructor.produceParameters .name
        else 
            //default constructor
            .out DEFAULT_ARGUMENTS
        end if
        .out ";",NL,NL
        */

        .out {h:0},NL //end header output

        // keep a list of classes|namespaces in each moudle, to out __registerClass
        classes.push this

      
Now on the .c file:

a) the __init constructor ( void function [name]__init)

        //.out {COMMENT:"constructor"},NL

        if theConstructor
            theConstructor.produce 
            .out ";",NL
        
        else // a default constructor
            .out "//auto ",.name,"__init",NL
            .out "void ",.name,"__init",DEFAULT_ARGUMENTS,"{",NL
            if .varRefSuper and .varRefSuper.toString() isnt 'Object'
                .out "    ",{COMMENT:["//auto call super__init, to initialize first part of space at *this.value.ptr"]},NL
                .out "    ",.varRefSuper,"__init(this,argc,arguments);",NL

            //initialize properties with assigned values
            .producePropertyAssignments .name

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

        // .out NL,{COMMENT:'end class '},.name,NL
        .skipSemiColon = true

#### method producePropertyAssignments(className)

        if .body
            for each item in .body.statements where item.statement is instance of Grammar.PropertiesDeclaration
                declare item.statement:Grammar.PropertiesDeclaration
                //initialize properties with assigned values
                item.statement.produceAssignments className


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

        Grammar.ClassDeclaration.prototype.produce.call(this)

/*
        //.out no .varRef.accessors? 'var ':'' ,.varRef,'={};'
        var namespaceName = .varRef.toString().replace(/\./g,'_')
        .out "//-------------------",NL
        .out "//namespace ", namespaceName ,NL
        .out .body

        //.out .body
        .skipSemiColon = true
*/

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
            .out 'switch(anyToInt64(', .varRef, ')){',NL
            .out .cases
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


### Append to class Grammar.SwitchCase ###

      method produce()

        for each expression in .expressions
            expression.produceType = 'Number'

        .out {pre:'case ', CSL:.expressions, post:':', separator:' '}
        .out .body
        .body.out 'break;',NL


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
              caseWhenSection.booleanExpression.produceType = 'Bool'
              caseWhenSection.out '(',caseWhenSection.booleanExpression,') ? (', caseWhenSection.resultExpression,') :',NL

          .out '/* else */ ',.elseExpression or 'undefined'


### Append to class Grammar.YieldExpression ###

      method produce()

Check location
      
        if no .getParent(Grammar.FunctionDeclaration) into var functionDeclaration 
            or no functionDeclaration.hasAdjective('nice')
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

#### helper method assignIfUndefined(name,expression) 
          
          .out "if(",name,'.type==UNDEFINED) ',name,"=",expression,";",NL

#### helper method addMethodDispatcher(methodName,className) 

For C production, we're using a dispatcher for each method name

          methodName = fixCReservedWord(methodName)

          // look in existing dispatchers
          if not allDispatchersNameDecl.findOwnMember(methodName) into var dispatcherNameDecl 
              dispatcherNameDecl = allDispatchersNameDecl.addMember(methodName)

          if className
              //create a case for the class in the dispatcher
              if dispatcherNameDecl.findOwnMember(className) 
                  .throwError "DUPLICATED METHOD: a method named '#{methodName}' already exists for class '#{className}'"
              var caseNameDecl = dispatcherNameDecl.addMember(className)

              #store a pointer to this FunctonDeclaration, to later code case call w parameters
              if this is instance of Grammar.FunctionDeclaration
                  caseNameDecl.funcDecl = this 

--------------------------------
