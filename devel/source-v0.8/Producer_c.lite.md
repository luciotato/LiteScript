Producer C
===========

The `producer` module extends Grammar classes, adding a `produce()` method 
to generate target code for the node.

The compiler calls the `.produce()` method of the root 'Module' node 
in order to return the compiled code for the entire tree.

We extend the Grammar classes, so this module require the `Grammar` module.

    import 
      Project
      Parser, ASTBase, Grammar
      Names
      Environment, logger, color, UniqueID

    shim import LiteCore, Map
      
"C" Producer Functions
==========================

module vars  

    # list of classes, to call _newClass & _declareMethodsAndProps
    var allClasses: array of Grammar.ClassDeclaration = []

store each distinct method name (globally).
We start with core-supported methods. 
Method get a trailing "_" if they're a C reserved word

    var allMethodNames: Map string to Names.Declaration = {}  // all distinct methodnames, to declare method symbols
    var allPropertyNames: Map string to Names.Declaration = {} // all distinct propname, to declare props symbols

    var coreSupportedMethods = [
        "toString"
        "tryGetMethod","tryGetProperty","getProperty", "getPropertyName"
        "has", "get", "set", "clear", "delete", "keys"
        "slice", "split", "indexOf", "lastIndexOf", "concat"
        "toUpperCase", "toLowerCase","charAt", "replaceAll","trim"
        "toDateString","toTimeString","toUTCString","toISOString"
        "shift","push","unshift", "pop", "join","splice"
    ]

    var coreSupportedProps = [
        'name','value','message','stack','code'
    ]

    public var dispatcherModule: Grammar.Module

    var appendToCoreClassMethods: array of Grammar.MethodDeclaration = []

    var DEFAULT_ARGUMENTS = "(any this, len_t argc, any* arguments)"


### Public function postProduction(project)

create _dispatcher.c & .h

        dispatcherModule = new Grammar.Module()
        declare valid project.options
        dispatcherModule.lexer = new Parser.Lexer(project, project.options)

        project.redirectOutput dispatcherModule.lexer.outCode // all Lexers now out here        

        dispatcherModule.fileInfo = Environment.fileInfoNewFile("_dispatcher", project.options.target)
        dispatcherModule.produceDispatcher project

        var resultLines:string array =  dispatcherModule.lexer.outCode.getResult() //get .c file contents
        if resultLines.length
            Environment.externalCacheSave dispatcherModule.fileInfo.outFilename,resultLines

        resultLines =  dispatcherModule.lexer.outCode.getResult(1) //get .h file contents
        if resultLines.length
            Environment.externalCacheSave '#{dispatcherModule.fileInfo.outFilename.slice(0,-1)}h',resultLines

        logger.msg "#{color.green}[OK] -> #{dispatcherModule.fileInfo.outRelFilename} #{color.normal}"
        logger.extra #blank line

    end function

    helper function normalizeDefine(name:string)
        var chr, result=""
        for n=0 to name.length
            chr=name.charAt(n).toUpperCase()
            if chr<'A' or chr>'Z', chr="_"
            result="#{result}#{chr}"

        return result


### Append to class Grammar.Module ###

#### method produceDispatcher(project)

        var requiredHeaders: Grammar.Module array = []

_dispatcher.h

        .out 
            {h:1},NL
            '#ifndef #{normalizeDefine(.fileInfo.outRelFilename)}_H',NL
            '#define #{normalizeDefine(.fileInfo.outRelFilename)}_H',NL,NL
            '#include "../core/LiteC-core.h"',NL,NL,NL

LiteC__init extern declaration

        .out 
            NL,{COMMENT: 'core support and defined classes init'},NL
            'extern void __declareClasses();',NL,NL

verbs & things

now all distinct method names

        .out 
            {COMMENT: 'methods'},NL,NL
            "enum _VERBS { //a symbol for each distinct method name",NL

        var initialValue = " = -_CORE_METHODS_MAX-#{allMethodNames.size}"
        for each methodDeclaration in map allMethodNames
            .out '    ',makeSymbolName(methodDeclaration.name),initialValue,",",NL
            initialValue=undefined
        .out NL,"_LAST_VERB};",NL

all  distinct property names

        .out 
            {COMMENT: 'propery names'},NL,NL
            "enum _THINGS { //a symbol for each distinct property name",NL

        initialValue = "= _CORE_PROPS_LENGTH"
        for each name,value in map allPropertyNames
            .out '    ',makeSymbolName(name), initialValue, ",",NL
            initialValue=undefined
        .out NL,"_LAST_THING};",NL,NL,NL

Now include headers for all the imported modules.
To put this last is important, because if there's a error in the included.h 
and it's *before* declaring _VERBS and _THINGS, _VERBS and _THINGS don't get
declared and the C compiler shows errors everywhere

        for each moduleNode:Grammar.Module in map project.moduleCache
            var hFile = moduleNode.fileInfo.outWithExtension(".h")
            hFile = Environment.relativeFrom(.fileInfo.outDir, hFile)
            .out '#include "#{hFile}"',NL

        .out NL,NL,"#endif",NL,NL

_dispatcher.c

        .out 
            {h:0},NL
            '#include "_dispatcher.h"',NL,NL,NL,NL

static definition added verbs (methods) and things (properties)

        .out 
            {COMMENT: 'methods'},NL,NL
            "static str _ADD_VERBS[] = { //string name for each distinct method name",NL
            {pre:'    "', CSL:allMethodNames.keys(), post:'"\n'}
            '};',NL,NL

all  distinct property names

        .out 
            {COMMENT: 'propery names'},NL,NL
            "static str _ADD_THINGS[] = { //string name for each distinct property name",NL
            {pre:'    "', CSL:allPropertyNames.keys(), post:'"\n'}
            '};',NL,NL

All literal Maps & arrays

        /*for each nameDecl in map .scope.members
            where nameDecl.nodeDeclared instanceof Grammar.Literal
                .out nameDecl,";",NL
        */

_dispatcher.c contains main function

        .out 
            "\n\n\n//-------------------------------",NL
            "int main(int argc, char** argv) {",NL
            '    LiteC_init(argc,argv);',NL
            '    LiteC_addMethodSymbols( #{allMethodNames.size}, _ADD_VERBS);',NL
            '    LiteC_addPropSymbols( #{allPropertyNames.size}, _ADD_THINGS);',NL
            

process methods appended to core classes, by calling LiteC_registerShim

        .out '\n'
        for each methodDeclaration in appendToCoreClassMethods
                var appendToDeclaration = methodDeclaration.getParent(Grammar.ClassDeclaration)
                .out '    LiteC_registerShim(',appendToDeclaration.varRef,
                     ',#{methodDeclaration.name}_,',
                     appendToDeclaration.varRef,'_',methodDeclaration.name,');',NL

call __ModuleInit for all the imported modules. call the base modules init first
    
        var moduleList: array of Grammar.Module=[]

        for each moduleNode:Grammar.Module in map project.moduleCache
            where moduleNode isnt project.main
                moduleList.push moduleNode //order in moduleCache is lower level to higher level
        
        .out '\n'
        for each nodeModule in moduleList
            .out '    ',nodeModule.fileInfo.base,'__moduleInit();',NL 

call main module __init

        .out '\n\n    ',project.main.fileInfo.base,'__moduleInit();',NL 

        .out '}',NL, {COMMENT: 'end main'},NL


#### method produce() # Module

default #includes:
"LiteC-core.h" in the header, the .h in the .c

        .out 
            {h:1},NL
            '#ifndef #{normalizeDefine(.fileInfo.outRelFilename)}_H',NL
            '#define #{normalizeDefine(.fileInfo.outRelFilename)}_H',NL,NL

        var thisBase = Environment.dirName(.fileInfo.outFilename)

        declare valid .parent.fileInfo.outFilename
        var dispatcherFull = "#{Environment.dirName(.parent.fileInfo.outFilename)}/_dispatcher.h"
        .out '#include "#{Environment.relativeFrom(thisBase,dispatcherFull)}"',NL

        var prefix=.fileInfo.base

header

        .out 
            "//-------------------------",NL
            "//Module ",prefix, NL
            "//-------------------------",NL

Modules have a __moduleInit function holding module items initialization and any loose statements

        .out "extern void ",prefix,"__moduleInit(void);",NL

Interfaces have a __nativeInit function to provide a initialization opportunity 
to module native support

        if .fileInfo.isInterface // add call to native hand-coded C support for this module 
            .out "extern void ",prefix,"__nativeInit(void);",NL

Since we cannot initialize a module var at declaration in C (err:initializer element is not constant),
we separate declaration from initialization.

Var names declared inside a module/namespace, get prefixed with namespace name

module vars declared public 

        // add each public/export item as a extern declaration
        .produceDeclaredExternProps prefix

Now produce the .c file,

        .out 
            {h:0} //on .c
            '#include "#{prefix}.h"',NL,NL
            "//-------------------------",NL
            "//Module ",prefix, .fileInfo.isInterface? ' - INTERFACE':'',NL
            "//-------------------------",NL

        // add sustance for the module
        .produceSustance prefix

__moduleInit: module main function 

        .out 
            "\n\n//-------------------------",NL
            "void ",prefix,"__moduleInit(void){",NL

        /*
        for each nameDecl in map .scope.members

            if nameDecl.nodeDeclared instanceof Grammar.ObjectLiteral

                .out nameDecl, "=new(Map,"

                var objectLiteral = nameDecl.nodeDeclared
                if no objectLiteral.items or objectLiteral.items.length is 0
                    .out "0,NULL"
                else
                    .out 
                        objectLiteral.items.length,',(any_arr){'
                        {CSL:objectLiteral.items}
                        NL,"}"
                
                .out ");",NL

            else if nameDecl.nodeDeclared instanceof Grammar.ArrayLiteral

                .out nameDecl,"=new(Array,"

                var arrayLiteral = nameDecl.nodeDeclared
                if no arrayLiteral.items or arrayLiteral.items.length is 0
                    .out "0,NULL"
                else
                    // e.g.: LiteScript:   var list = [a,b,c]
                    // e.g.: "C": any list = (any){Array_TYPEID,.value.arr=&(Array_s){3,.item=(any_arr){a,b,c}}};
                    .out arrayLiteral.items.length,",(any_arr){",{CSL:arrayLiteral.items},"}"

                .out ");",NL

        end for
        */

        .produceMainFunctionBody prefix

        if .fileInfo.isInterface // add call to native hand-coded C support for this module 
            .out NL,'    ',prefix,"__nativeInit();"

        .out NL,"};",NL

        .skipSemiColon = true


close .h #ifdef

        .out 
            {h:1}
            NL,'#endif',NL
            {h:0}


----------------------------

## Grammar.ClassDeclaration & derivated

### Append to class Grammar.AppendToDeclaration ###

Any class|object can have properties or methods appended at any time. 
Append-to body contains properties and methods definitions.

      method produceHeader() 

        var nameDeclClass = .varRef.tryGetReference() // get class being append to
        if no nameDeclClass, return .sayErr("append to: no reference found")

        if .toNamespace
                .body.produceDeclaredExternProps nameDeclClass.getComposedName(), true
                return //nothing more to do if it's "append to namespace"

handle methods added to core classes

        if nameDeclClass.nodeDeclared and nameDeclClass.nodeDeclared.name is "*Global Scope*"

for each method declaration in .body

            for each item in .body.statements
                where item.specific.constructor is Grammar.MethodDeclaration 
                    declare item.specific: Grammar.MethodDeclaration 

                    if no item.specific.nameDecl, continue // do not process, is a shim

keep a list of all methods appended to core-defined classes (like String)
they require a special registration, because the class pre-exists in core

                    appendToCoreClassMethods.push item.specific

also add to allMethods, since the class is core, is not declared in this project

                    item.specific.nameDecl.addToAllMethodNames

out header

                    .out 'extern any ',item.specific.nameDecl.getComposedName(),"(DEFAULT_ARGUMENTS);",NL                            



      method produce() 

        //if .toNamespace, return //nothing to do if it's "append to namespace"
        .out .body
        .skipSemiColon = true


### Append to class Grammar.NamespaceDeclaration ###
namespaces are like modules inside modules

#### method produceCallNamespaceInit()
        .out '    ',.makeName(),'__namespaceInit();',NL

#### method makeName()

        var prefix = .nameDecl.getComposedName()

if this is a namespace declared at module scope, we check if it has 
the same name as the module. If it does, is the "default export",
if it not, we prepend module name to namespace name. 
(Modules act as namespaces, var=property, function=method)

        if .nameDecl.parent.isScope //is a namespace declared at module scope
            var moduleNode:Grammar.Module = .getParent(Grammar.Module)
            if moduleNode.fileInfo.base is .nameDecl.name
                //this namespace have the same name as the module
                do nothing //prefix is OK
            else
                //append modulename to prefix
                prefix = "#{moduleNode.fileInfo.base}_#{prefix}"
            end if
        end if

        return prefix

#### method produceHeader
                       
        var prefix= .makeName()

        .out 
            "//-------------------------",NL
            "// namespace ",prefix,NL
            "//-------------------------",NL

all namespace methods & props are public 

        // add each method
        var count=0
        var namespaceMethods=[]
        for each member in map .nameDecl.members
            where member.name not in ['constructor','length','prototype']
                if member.isProperty
                    .out '    extern var ',prefix,'_',member.name,';',NL
                else if member.isMethod
                    .out '    extern any ',prefix,'_',member.name,'(DEFAULT_ARGUMENTS);',NL
            
         // recurse, add internal classes and namespaces
        .body.produceDeclaredExternProps prefix, forcePublic=true


#### method produce

        var prefix= .makeName()
        var isPublic = .hasAdjective('export')

        //logger.debug "produce Namespace",c

Now on the .c file,

        .out 
            "//-------------------------",NL
            "//NAMESPACE ",prefix,NL
            "//-------------------------",NL

        .body.produceSustance prefix

__namespaceInit function

        .out 
            NL,NL,"//------------------",NL
            "void ",prefix,"__namespaceInit(void){",NL

        .body.produceMainFunctionBody prefix
        .out "};",NL

        .skipSemiColon = true


### Append to class Grammar.ClassDeclaration ###

#### method produceHeader()

        if no .nameDecl, return //shim class

        // keep a list of classes in each moudle, to out __registerClass
        allClasses.push this

        var c = .nameDecl.getComposedName()

        //logger.debug "produce header class",c

header

        .outClassTitleComment c

In C we create a struct for "instance properties" of each class 

        .out 
            "typedef struct ",c,"_s * ",c,"_ptr;",NL
            "typedef struct ",c,"_s {",NL

out all properties, from the start of the "super-extends" chain

        .nameDecl.outSuperChainProps this

close instance struct

        .out NL,"} ",c,"_s;",NL,NL

and declare extern for class __init

        //declare extern for this class methods
        .out "extern void ",c,"__init(DEFAULT_ARGUMENTS);",NL


add each prop to "all properties list", each method to "all methods list"
and declare extern for each class method

        var classMethods=[]

        var prt = .nameDecl.findOwnMember('prototype')
        for each prtNameDecl in map prt.members
            where prtNameDecl.name not in ['constructor','length','prototype']
                if prtNameDecl.isProperty
                    // keep a list of all classes props
                    prtNameDecl.addToAllProperties
                else
                    // keep a list of all classes methods
                    prtNameDecl.addToAllMethodNames 

                    //declare extern for this class methods
                    .out "extern any ",c,"_",prtNameDecl.name,"(DEFAULT_ARGUMENTS);",NL


#### method produce()

        if no .nameDecl, return //shim class

        //logger.debug "produce body class",c

this is the class body, goes on the .c file,

        var c = .nameDecl.getComposedName()

        .outClassTitleComment c

        var hasConstructor: boolean
        for each index,item in .body.statements
            if item.specific instanceof Grammar.ConstructorDeclaration 
                if hasConstructor # what? more than one?
                    .throwError('Two constructors declared for class #{c}')
                hasConstructor = true

default constructor

        if not hasConstructor and not .getParent(Grammar.Module).fileInfo.isInterface
            // produce a default constructor
            .out 
                "//auto ",c,"__init",NL
                "void ",c,"__init",DEFAULT_ARGUMENTS,"{",NL

            if .varRefSuper
                .out 
                    "    ",{COMMENT:"//auto call super class __init"},NL
                    "    ",.varRefSuper,"__init(this,argc,arguments);",NL

            .body.producePropertiesInitialValueAssignments '((#{c}_ptr)this.value.ptr)->'

            // end default constructor
            .out "};",NL

produce class body

        .body.produce
        .skipSemiColon = true


-------------------------------------
#### helper method outClassTitleComment(c:string)

        .out 
            "\n\n//--------------",NL
            {COMMENT:c},NL
            'any #{c}; //Class ',c
            .varRefSuper? [' extends ',.varRefSuper,NL] else '', NL


-------------------------------------
#### method produceStaticListMethodsAndProps

static definition info for each class: list of _METHODS and _PROPS

        //skip NamespaceDeclaration & AppendToDeclaration (both derived from ClassDeclaration)
        if .constructor isnt Grammar.ClassDeclaration, return 

        var c = .nameDecl.getComposedName()

        .out 
            '//-----------------------',NL
            '// Class ',c,': static list of METHODS(verbs) and PROPS(things)',NL
            '//-----------------------',NL
            NL 
            "static _methodInfoArr ",c,"_METHODS = {",NL

        var propList=[]
        var prt = .nameDecl.findOwnMember('prototype')
        for each nameDecl in map prt.members
            where nameDecl.name not in ['constructor','length','prototype']
                if nameDecl.isMethod
                    .out '  { #{makeSymbolName(nameDecl.name)}, #{c}_#{nameDecl.name} },',NL
                else
                    propList.push makeSymbolName(nameDecl.name)

        .out 
            NL,"{0,0}}; //method jmp table initializer end mark",NL
            NL
            "static _posTableItem_t ",c,"_PROPS[] = {",NL
            {CSL:propList, post:'\n    '}
            "};",NL,NL

#### method produceClassRegistration

        //skip NamespaceDeclaration & AppendToDeclaration (both derived from ClassDeclaration)
        if .constructor isnt Grammar.ClassDeclaration, return 

        var c = .nameDecl.getComposedName()

        var superName = .nameDecl.superDecl? .nameDecl.superDecl.getComposedName() else 'Object' 

        .out 
            '    #{c} =_newClass("#{c}", #{c}__init, sizeof(struct #{c}_s), #{superName}.value.classINFOptr);',NL
            '    _declareMethods(#{c}, #{c}_METHODS);',NL
            '    _declareProps(#{c}, #{c}_PROPS, sizeof #{c}_PROPS);',NL,NL

-------------------------------------
### Append to class Names.Declaration
#### method outSuperChainProps(node:Grammar.ClassDeclaration) #recursive

out all properties of a class, including those of the super's-chain

        if .superDecl, .superDecl.outSuperChainProps node #recurse

        node.out '    //',.name,NL
        var prt = .ownMember('prototype')
        if no prt, .sayErr "class #{.name} has no prototype"

        for each prtNameDecl in map prt.members
            where prtNameDecl.name not in ['constructor','length','prototype']
                if prtNameDecl.isProperty
                    node.out '    any ',prtNameDecl.name,";",NL



### Append to class Grammar.Body 

A "Body" is an ordered list of statements.

"Body"s lines have all the same indent, representing a scope.

"Body"s are used for example, to parse an `if` statement body and `else` body, `for` loops, etc.

#### method produce()

        for each statement in .statements
          statement.produce()

        .out NL

#### method produceDeclaredExternProps(parentName,forcePublic)

        var prefix = parentName? "#{parentName}_" else ""

        // add each declared prop as a extern prefixed var
        for each item in .statements

            var isPublic = forcePublic or item.hasAdjective('export')

            switch item.specific.constructor

                case Grammar.VarStatement:
                    declare item.specific:Grammar.VarStatement
                    if isPublic, .out 'extern var ',{pre:prefix, CSL:item.specific.getNames()},";",NL

                case Grammar.FunctionDeclaration:
                    declare item.specific:Grammar.FunctionDeclaration
                    //export module function
                    if isPublic, .out 'extern any ',prefix,item.specific.name,"(DEFAULT_ARGUMENTS);",NL

                case Grammar.ClassDeclaration, Grammar.AppendToDeclaration:
                    declare item.specific:Grammar.ClassDeclaration
                    //produce class header declarations
                    item.specific.produceHeader
                    // class headers are always produced. Props are declared in header production

                case Grammar.NamespaceDeclaration:
                    declare item.specific:Grammar.NamespaceDeclaration
                    item.specific.produceHeader #recurses
                    // as in JS, always public. Must produce, can have classes inside


#### method produceSustance(prefix)

before main function,
produce body sustance: vars & other functions declarations

        var produceSecond: array of Grammar.Statement = []
        var produceThird: array of Grammar.Statement = []

        for each item in .statements

            if item.specific instanceof Grammar.VarDeclList // PropertiesDeclaration & VarStatement
                declare item.specific:Grammar.VarDeclList
                //just declare existence, do not assign. (C compiler: error: initializer element is not constant)
                .out 'var ',{pre:"#{prefix}_", CSL:item.specific.getNames()},";",NL

            //since C require to define a fn before usage. we make forward declarations
            // of all module functions, to avoid any ordering problem.
            else if item.specific.constructor is Grammar.FunctionDeclaration
                declare item.specific:Grammar.FunctionDeclaration
                //just declare existence, do not assign. (C compiler: error: initializer element is not constant)
                .out 'any ',prefix,'_',item.specific.name,"(DEFAULT_ARGUMENTS); //forward declare",NL
                produceThird.push item

            else if item.specific.constructor is Grammar.ClassDeclaration
                declare item.specific:Grammar.ClassDeclaration
                item.specific.produceStaticListMethodsAndProps
                produceSecond.push item.specific

            else if item.specific.constructor is Grammar.NamespaceDeclaration
                declare item.specific:Grammar.NamespaceDeclaration
                produceSecond.push item.specific #recurses

            else if item.specific.constructor is Grammar.AppendToDeclaration
                item.specific.callOnSubTree 'produceStaticListMethodsAndProps' //if there are internal classes
                produceThird.push item

            else if item.isDeclaration()
                produceThird.push item
        
        end for //produce vars functions & classes sustance

        for each item in produceSecond //class & namespace sustance
            item.produce

        for each item in produceThird //other declare statements
            item.produce


#### method produceMainFunctionBody(prefix)

First: register user classes

        .callOnSubTree 'produceClassRegistration'

Second: recurse for namespaces 

        .callOnSubTree 'produceCallNamespaceInit'

Third: assign values for module vars.
if there is var or properties with assigned values, produce those assignment.
User classes must be registered previously, in case the module vars use them as initial values.

        for each item in .statements 
            where item.specific instanceof Grammar.VarDeclList //for modules:VarStatement, for Namespaces: PropertiesDeclaration
                declare item.specific:Grammar.VarDeclList
                for each variableDecl in item.specific.list
                    where variableDecl.assignedValue
                        .out '    ',prefix,'_',variableDecl.name,' = ', variableDecl.assignedValue,";",NL


        // all other loose statements in module body
        .produceLooseExecutableStatements()


#### method producePropertiesInitialValueAssignments(fullPrefix)

if there is var or properties with assigned values, produce those assignment

        for each item in .statements 
            where item.specific.constructor is Grammar.PropertiesDeclaration 
                declare item.specific:Grammar.PropertiesDeclaration
                for each variableDecl in item.specific.list
                    where variableDecl.assignedValue
                        .out 'PROP(',variableDecl.name,'_,this)=',variableDecl.assignedValue,";",NL


#### method produceLooseExecutableStatements()
        // all loose executable statements in a namespace or module body
        for each item in .statements
            where item.isExecutableStatement()
                item.produce //produce here


-------------------------------------
### append to class Grammar.Statement ###

`Statement` objects call their specific statement node's `produce()` method
after adding any comment lines preceding the statement

      method produce()

        declare valid .specific.body

add comment lines, in the same position as the source

        .outPrevLinesComments()

To ease reading of compiled code, add original Lite line as comment 

        if .lexer.options.comments
          if .lexer.outCode.lastOriginalCodeComment<.lineInx
            if not (.specific.constructor in [
                Grammar.CompilerStatement, Grammar.DeclareStatement 
                Grammar.DoNothingStatement
              ])
              .out {COMMENT: .lexer.infoLines[.lineInx].text.trim()},NL
          .lexer.outCode.lastOriginalCodeComment = .lineInx

Each statement in its own line

        if .specific isnt instance of Grammar.SingleLineBody
          .lexer.outCode.ensureNewLine

if there are one or more 'into var x' in a expression in this statement, 
declare vars before the statement (exclude body of FunctionDeclaration)

        var methodToCall = LiteCore.getSymbol('declareIntoVar')
        this.callOnSubTree methodToCall, excludeClass=Grammar.Body

call the specific statement (if,for,print,if,function,class,etc) .produce()

        var mark = .lexer.outCode.markSourceMap(.indent)
        .out .specific

add ";" after the statement
then EOL comment (if it isnt a multiline statement)
then NEWLINE

        if not .specific.skipSemiColon
          .addSourceMap mark
          .out ";"
          if not .specific.body
            .out .getEOLComment()

helper function to determine if a statement is a declaration (can be outside a funcion in "C")
or a "statement" (must be inside a funcion in "C")

      helper method isDeclaration returns boolean

        return .specific is instance of Grammar.ClassDeclaration
            or .specific is instance of Grammar.FunctionDeclaration
            or .specific is instance of Grammar.VarStatement
            or .specific.constructor in [
                    Grammar.ImportStatement
                    Grammar.DeclareStatement
                    Grammar.CompilerStatement
                    ]

      helper method isExecutableStatement returns boolean

        return not .isDeclaration()

called above, pre-declare vars from 'into var x' assignment-expression

    append to class Grammar.Oper
      method declareIntoVar()
          if .intoVar
              .out "var ",.right,"=undefined;",NL


---------------------------------
### append to class Grammar.ThrowStatement ###

      method produce()
          if .specifier is 'fail'
            .out "throw(new(Error,1,(any_arr){",.expr,"}));"
          else
            .out "throw(",.expr,")"


### Append to class Grammar.ReturnStatement ###

      method produce()
        var defaultReturn = .getParent(Grammar.ConstructorDeclaration)? '' else 'undefined'
        

we need to unwind try-catch blocks, to calculate to which active exception frame
we're "returning" to

        var countTryBlocks = 0
        var node:ASTBase = this.parent
        do until node instance of Grammar.FunctionDeclaration

            if node.constructor is Grammar.TryCatch
                //a return inside a "TryCatch" block
                countTryBlocks++ //we need to explicitly unwind

            node = node.parent
        loop 

we reached function header here.
if the function had a ExceptionBlock, we need to unwind
because an auto "try{" is inserted at function start

        declare node:Grammar.FunctionDeclaration
        if node.hasExceptionBlock, countTryBlocks++ 

        if countTryBlocks
            .out "{e4c_exitTry(",countTryBlocks,");"

        .out 'return ',.expr or defaultReturn

        if countTryBlocks
            .out ";}"


### Append to class Grammar.FunctionCall ###

      method produce() 

Check if varRef "executes" 
(a varRef executes if last accessor is "FunctionCall" or it has --/++)

if varRef do not "executes" add "FunctionCall", 
so varRef production adds (), 
and C/JS executes the function call

        if no .varRef.executes, .varRef.addAccessor new Grammar.FunctionAccess(.varRef)

        var result = .varRef.calcReference()
        .out result


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
            if strValue.charAt(0) is "'"
                strValue = .name.getValue() // w/o quotes
                strValue = strValue.replaceAll("\"",'\\"') // escape internal " => \"
                strValue = '"#{strValue}"' // enclose in ""

            if strValue is '""' 
                .out "any_EMPTY_STR"
            else if .produceType is 'Number' and (strValue.length is 3 or strValue.charAt(1) is '/' and strValue.length is 4) //a single char (maybe escaped)
                .out "'", strValue.slice(1,-1), "'" // out as C 'char' (C char = byte, a numeric value)
            else
                .out "any_str(",strValue,")"

            .out .accessors

        else if .name instance of Grammar.NumberLiteral

            if .produceType is 'any'
                pre="any_number("
                post=")"

            .out pre,.name,.accessors,post

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

      method produce() 
        
        var translated = operTranslate(.name)
        var prepend,append

Consider "not": 
if it is "boolean not", add parentheses, because js has a different precedence for "boolean not"
-(prettier generated code) do not add () for simple "falsey" variable check: "if no x"

        if translated is "!" 
            if not (.name is "no" and .right.name instanceof Grammar.VariableRef)
                prepend ="("
                append=")"

Special cases

        var pre,post

        if translated is "new" and .right.name instance of Grammar.VariableRef
            declare .right.name:Grammar.VariableRef
            .out "new(", .right.name.calcReference(callNew=true)
            return

        if translated is "typeof" 
            pre="_typeof("
            translated=""
            post=")"

        else
            if .produceType is 'any'
                pre="any_number("
                post=")"

            .right.produceType = translated is "!"? 'Bool' else 'Number' //Except "!", unary opers require numbers

        end if

//add a space if the unary operator is a word. Example `typeof`
//            if /\w/.test(translated), translated+=" "

        .out pre, translated, prepend, .right, append, post


### append to class Grammar.Oper ###

      properties
          produceType: string

      method produce()

        var oper = .name

Discourage string concat using '+':

+, the infamous js string concat. You should not use + to concat strings. use string interpolation instead.
e.g.: DO NOT: `stra+": "+strb`   DO: `"#{stra}: #{strb}"`

        if oper is '+'
            var lresultNameDecl = .left.getResultType() 
            var rresultNameDecl = .right.getResultType() 
            if (lresultNameDecl and lresultNameDecl.isInstanceof('String'))
                or (rresultNameDecl and rresultNameDecl.isInstanceof('String'))
                    .sayErr """
                            You should not use + to concat strings. use string interpolation instead.
                            e.g.: DO: "#\{stra}: #\{strb}"  vs.  DO NOT: stra + ": " + strb
                            """

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
            if .right.name instanceof Grammar.ArrayLiteral
                var haystack:Grammar.ArrayLiteral = .right.name
                .out toAnyPre,prepend,"__in(",.left,",",haystack.items.length,",(any_arr){",{CSL:haystack.items},"})",append,toAnyPost
            else
                .out toAnyPre,"CALL1(indexOf_,",.right,",",.left,").value.number", .negated? "==-1" : ">=0",toAnyPost

2) *'has property'* operator, requires swapping left and right operands and to use js: `in`

          case 'has property':
            .throwError "NOT IMPLEMENTED YET for C"
            //.out toAnyPre,"indexOf(",.right,",1,(any_arr){",.left,"}).value.number", .negated? "==-1" : ">=0",toAnyPost

3) *'into'* operator (assignment-expression), requires swapping left and right operands and to use: `=`

          case 'into':
            if .produceType and .produceType isnt 'any', .out '_anyTo',.produceType,'('
            .left.produceType='any'
            .out "(",.right,"=",.left,")"
            if .produceType and .produceType isnt 'any', .out ')'

4) *instanceof* use core _instanceof(x,y)

          case 'instance of':
            .left.produceType = 'any'
            .right.produceType = 'any'
            .out toAnyPre,prepend,'_instanceof(',.left,',',.right,')',append,toAnyPost

4b) *'like'* operator (RegExp.test), requires swapping left and right operands and to use js: `.test()`

          case 'like':
            .throwError "like not supported yet for C-production"
            //.out toAnyPre,prepend,'RegExp_test(',.left,',"',.right,'")',append,toAnyPost

5) equal comparisions require both any

          case 'is':
            .left.produceType = 'any'
            .right.produceType = 'any'
            .out toAnyPre,.negated?'!':'', '__is(',.left,',',.right,')',toAnyPost

6) js's '||' operator returns first expression if it's true, second expression is first is false, 0 if both are false
   so it can be used to set a default value if first value is undefined,0,null or ""
   C's '||' operator, returns 1 (not the first expression. Expressions are discarded in C's ||)

          case 'or':
            .left.produceType = 'any'
            .right.produceType = 'any'
            if .produceType and .produceType isnt 'any', .out '_anyTo',.produceType,'('
            .out '__or(',.left,',',.right,')'
            if .produceType and .produceType isnt 'any', .out ')'

modulus is only for integers. for doubles, you need fmod (and link the math.lib)
we convert to int, as js seems to do.

          case '%':
            if .produceType and .produceType isnt 'Number', .out 'any_number('
            .left.produceType = 'Number'
            .right.produceType = 'Number'
            .out '(int64_t)',.left,' % (int64_t)',.right
            if .produceType and .produceType isnt 'Number', .out ')'

else we have a direct translatable operator. 
We out: left,operator,right

          default:

            var operC = operTranslate(oper) 
            
            switch operC

                case '?': // left is condition, right is: if_true
                    .left.produceType = 'Bool'
                    .right.produceType = .produceType

                case ':': // left is a?b, right is: if_false
                    .left.produceType = .produceType
                    .right.produceType = .produceType

                case '&&': // boolean and
                    .left.produceType = 'Bool'
                    .right.produceType = 'Bool'

                default //default for binary opers: numbers
                    .left.produceType = 'Number'
                    .right.produceType = 'Number'

            var extra, preExtra

            if operC isnt '?' // cant put xx( a ? b )
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
                      preExtra = '_anyTo#{.produceType}('
                      extra = ")"

            .out preExtra, prepend, .left,' ', operC, ' ',.right, append, extra

        end case oper


### append to class Grammar.Expression ###

      properties
          produceType: string

      method produce(negated) 

Produce the expression body, optionally negated

        default .produceType='any'

        var prepend=""
        var append=""
        if negated

(prettier generated code) Try to avoid unnecessary parens after '!' 
for example: if the expression is a single variable, as in the 'falsey' check: 
Example: `if no options.logger then... ` --> `if (!options.logger) {...` 
we don't want: `if (!(options.logger)) {...` 

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


### append to class Grammar.FunctionArgument ###

        method produce
            .out .expression


### helper function makeSymbolName(symbol)
        // hack: make "symbols" avoid interference with C's reserved words
        // and also common variable names
        return "#{symbol}_"

### append to class Grammar.VariableRef ###

`VariableRef: ['--'|'++'] IDENTIFIER [Accessors] ['--'|'++']`

`VariableRef` is a Variable Reference. 

 a VariableRef can include chained 'Accessors', which can:
 *access a property of the object : `.`-> PropertyAccess `[`->IndexAccess
 *assume the variable is a function and perform a function call :  `(`-> FunctionAccess

      properties
          produceType: string 
          calcType: string // 'any','Number','Bool','**native number**'

      method produce() 

Prefix ++/--, varName, Accessors and postfix ++/--

        if .name is 'arguments'
            .out '_newArray(argc,arguments)'
            return

        var result = .calcReference()

        var pre,post

        if .produceType is 'any' and not .calcType is 'any'
            pre = 'any_number('
            post = ')'
        
        else if .produceType and .produceType isnt 'any' and .calcType is 'any'
            pre = '_anyTo#{.produceType}('
            post = ')'

        .out pre, result, post

##### helper method calcReference(callNew) returns array of array

        var result = .calcReferenceArr(callNew)

PreIncDec and postIncDec: ++/--

        var hasIncDec = .preIncDec or .postIncDec
        
        if hasIncDec 

            if no .calcType
                .throwError "pre or post inc/dec (++/--) can only be used on simple variables"

            if .calcType is 'any'
                result.push ['.value.number']
                .calcType = 'Number'

            else //assume number
                do nothing

        if .postIncDec
            result.push [.postIncDec]

        if .preIncDec
            result.unshift [.preIncDec]

        return result

##### helper method calcReferenceArr(callNew) returns array of array

Start with main variable name, to check property names

        var actualVar = .tryGetFromScope(.name)
        if no actualVar, .throwError("var '#{.name}' not found in scope")

        var result: array = [] //array of arrays
        
        var partial = actualVar.getComposedName()

        result.push [partial]

        .calcType = 'any' //default
        if actualVar.findOwnMember("**proto**") is '**native number**', .calcType = '**native number**'

        if no .accessors, return result

now follow each accessor

        var avType:Names.Declaration
        
        var hasInstanceReference:boolean

        var isOk, functionAccess, args:array

        for each inx,ac in .accessors
            declare valid ac.name

            //if no actualVar
            //    .throwError("processing '#{partial}', cant follow property chain types")

for PropertyAccess

            if ac instanceof Grammar.PropertyAccess

                var classNameArr:array

                if ac.name is 'constructor' //hack, all vars have a "constructor". 
                    //convert "bar.constructor" to: "any_class(bar.class)"
                    //var classNameArr:array = result.pop()
                    result.unshift ['any_class(']
                    // here goes any class
                    result.push [".class)"]
                    //result.push classNameArr
                    .calcType = 'any'
                    hasInstanceReference=true
                    if actualVar, actualVar = actualVar.findOwnMember('**proto**')

                else if ac.name is 'prototype' //hack, all classes have a "prototype" to access methods
                    //convert "Foo.prototype.toString" to: "__classMethodAny(toString,Foo)"
                    if inx+1 >= .accessors.length or .accessors[inx+1].constructor isnt Grammar.PropertyAccess
                        .sayErr "expected: Class.prototype.method, e.g.: 'Foo.prototype.toString'"
                    else
                        classNameArr = result.pop()
                        classNameArr.unshift '__classMethodFunc(',.accessors[inx+1].name,"_ ," //__classMethodFunc(methodName,
                        // here goes any class
                        classNameArr.push ")"
                        result.push classNameArr //now converted to any Function
                        inx+=1 //skip method name
                        .calcType = 'any' // __classMethodFunc returns any_func
                        hasInstanceReference = true
                        
                        actualVar = .tryGetFromScope('Function')
                        if actualVar, actualVar=actualVar.findOwnMember('prototype') //actual var is now function prototype

                else if ac.name is 'length' //hack, convert x.length in a funcion call, _length(x)
                    result.unshift ['_length','('] // put "length(" first - call to dispatcher
                    result.push [")"]
                    .calcType = '**native number**'
                    actualVar = undefined

                else if ac.name is 'call' 
                    //hack: .call
                    // this is .call use __apply(Function,instance,argc,arguments)

                    //should be here after Class.prototype.xxx.call
                    if no actualVar or no actualVar.findMember('call')
                        .throwError 'cannot use .call on a non-Function. Use: Class.prototype.method.call(this,arg1,...)'

                    //let's make sure next accessor is FunctionAccess with at least one arg
                    isOk=false

                    if inx+1<.accessors.length 
                        if .accessors[inx+1].constructor is Grammar.FunctionAccess
                            functionAccess=.accessors[inx+1]
                            if functionAccess.args and functionAccess.args.length >= 1
                                isOk=true

                    if no isOk, .throwError 'expected instance and optional arguments after ".call": foo.call(this,arg1,arg2)'
                    
                    args = functionAccess.args

                    result.unshift ['__apply(']
                    //here goes Function ref
                    var FnArr = [",",args[0],","] // instance
                    .addArguments args.slice(1), FnArr //other arguments
                    FnArr.push ')'

                    result.push FnArr
                    inx+=1 //skip fn.call and args
                    actualVar = undefined


                else if ac.name is 'apply' 
                    //hack: .apply
                    // this is .apply(this,args:anyArr) use __applyArr(Function,instance,anyArgsArray)

                    //should be here after Class.prototype.xxx.apply
                    if no actualVar or no actualVar.findMember('apply')
                        .throwError 'cannot use .apply on a non-Function. Use: Class.prototype.method.apply(this,args:Array)'

                    //let's make sure next accessor is FunctionAccess with at least one arg
                    isOk=false
                    if inx+1<.accessors.length 
                        if .accessors[inx+1].constructor is Grammar.FunctionAccess
                            functionAccess=.accessors[inx+1]
                            if functionAccess.args and functionAccess.args.length >= 2
                                isOk=true

                    if no isOk, .throwError 'expected two arguments after ".apply". e.g.: foo.apply(this,argArray)'
                    
                    args = functionAccess.args

                    result.unshift ['__applyArr(', hasInstanceReference? '': 'any_func(']
                    //here goes Function ref
                    result.push [hasInstanceReference? '': ')',',',args[0],',',args[1],')']

                    inx+=1 //skip fn.call and args
                    actualVar = undefined

                else if actualVar and actualVar.isNamespace //just namespace access
                    var prevArr:array = result.pop() 
                    prevArr.push "_",ac.name
                    result.push prevArr

                    actualVar = actualVar.findOwnMember(ac.name)

                else if inx+1 < .accessors.length and .accessors[inx+1].constructor is Grammar.FunctionAccess
                    // if next is function access, this is a method name. just make name a symbol
                    result.push [makeSymbolName(ac.name)]
                    .calcType = 'any'
                    hasInstanceReference=true
                    if actualVar, actualVar = actualVar.findOwnMember(ac.name)

                else
                    // normal property access
                    //out PROP(propName,instance)
                    .calcType = 'any'
                    hasInstanceReference=true
                    result.unshift ["PROP","(", makeSymbolName(ac.name), ","] // PROP macro enclose all 
                    // here goes thisValue (instance)
                    result.push [")"]

                    if actualVar, actualVar = actualVar.findOwnMember(ac.name)

                end if // subtypes of propertyAccess

                partial ="#{partial}.#{ac.name}"

else, for FunctionAccess

            else if ac.constructor is Grammar.FunctionAccess

                partial ="#{partial}(...)"
                .calcType = 'any'

                functionAccess = ac

                //we're calling on an IndexAccess or the result of a function. Mandatory use of apply/call
                if inx>1 and .accessors[inx-1].constructor isnt Grammar.PropertyAccess
                    .throwError("'#{partial}.call' or '.apply' must be used to call a function pointer stored in a variable")

                var callParams:array

                if callNew
                    callParams = [","] // new(Class,argc,arguments*)
                    //add arguments: count,(any_arr){...}
                    .addArguments functionAccess.args, callParams

                else
                    var fnNameArray:array = result.pop() //take fn name 
                    if no hasInstanceReference //first accessor is function access, this is a call to a global function

                        fnNameArray.push "(" //add "(" 
                        //if fnNameArray[0] is 'Number', fnNameArray[0]='_toNumber'; //convert "Number" (class name) to fn "_toNumber"
                        result.unshift fnNameArray // put "functioname" first - call to global function

                        if fnNameArray[0] is '_concatAny'
                            callParams =[] // no "thisValue" for internal _concatAny, just params to concat
                        else
                            callParams = ["undefined", ","] //this==undefined as in js "use strict" mode

                        //add arguments: count,(any_arr){...}
                        .addArguments functionAccess.args, callParams

                    else
                        //method call

                        //to ease C-code reading, use macros CALL1 to CALL4 if possible
                        if functionAccess.args and functionAccess.args.length<=4

                            // __call enclose all
                            fnNameArray.unshift "CALL#{functionAccess.args.length}(" 
                            // here goes methodName
                            fnNameArray.push "," // CALLn(symbol_ *,*
                            // here: instance reference as 2nd param (this value)
                            result.unshift fnNameArray //prepend CALLn(method_,instanceof,...
                            callParams = functionAccess.args.length? [","] else []
                            callParams.push {CSL:functionAccess.args}

                        else // do not use macros CALL1 to CALL4

                            // __call enclose all
                            fnNameArray.unshift "__call(" 
                            // here goes methodName
                            fnNameArray.push "," // __call(symbol_ *,*
                            // here: instance reference as 2nd param (this value)
                            result.unshift fnNameArray //prepend __call(methodName, ...instanceof
                            //options.validations.push ["assert("].concat(callParams,".type>TYPE_NULL);")
                            callParams = [","]
                            //add arguments: count,(any_arr){...}
                            .addArguments functionAccess.args, callParams

                        end if
                
                    end if //global fn or method

                end if //callNew

                callParams.push ")" //close __call(symbol,this,argc, any* arguments )  | function(undefined,arg,any* arguments)
                result.push callParams

                if actualVar, actualVar = actualVar.findMember('**return type**')
                #the actualVar is now function's return type'
                #and next property access should be on defined members of the return type


else, for IndexAccess, the varRef type is now 'name.value.item[...]'
and next property access should be on defined members of the type

            else if ac.constructor is Grammar.IndexAccess
                
                partial ="#{partial}[...]"

                .calcType = 'any'

                declare ac:Grammar.IndexAccess

                //ac.name is a Expression
                ac.name.produceType = 'Number'

                //add macro ITEM(index, array )
                //macro ITEM() encloses all 
                result.unshift ["ITEM(",ac.name,"," ]
                // here goes instance
                result.push [")"]

                if actualVar, actualVar = actualVar.findOwnMember('**item type**')

            end if //type of accessor

        end for #each accessor

        return result



      method getTypeName() returns string

        var opt = new Names.NameDeclOptions
        opt.informError = true
        opt.isForward = true
        opt.isDummy = true
        var avType = .tryGetReference(opt)
        #get type name
        var typeStr = avType.name
        if typeStr is 'prototype'
            typeStr = avType.parent.name
        end if

        return typeStr

    
      helper method addArguments(args:array , callParams:array)

        //add arguments[] 
        if args and args.length
            callParams.push "#{args.length},(any_arr){",{CSL:args},"}"
            //,freeForm:true,indent:String.spaces(8)
        else
            callParams.push "0,NULL"



### append to class Grammar.AssignmentStatement ###

      method produce() 

        var extraLvalue='.value.number'
        if .lvalue.tryGetReference() into var nameDecl
            and nameDecl.findOwnMember('**proto**') is '**native number**'
                extraLvalue=undefined

        var oper = operTranslate(.name)
        switch oper
            case "+=","-=","*=","/=":

                .rvalue.produceType = 'Number'
                .out .lvalue,extraLvalue,' ', oper,' ',.rvalue

            default:
                .rvalue.produceType = 'any'
                .out .lvalue, ' ', operTranslate(.name), ' ' , .rvalue

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

          .throwError "default for objects not supported on C-generation"
          /*
          .out "_defaultObject(&",main,");",NL

          for each nameValue in objectLiteral.items
            var itemFullName = [main,'.',nameValue.name]
            .process(itemFullName, nameValue.value)
          */
    
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

        .out "var ",.nameDecl.getComposedName(),'=',.varRef,";"
        .out .body



---

### Append to class Names.Declaration ###

      method addToAllProperties

        var name = .name
        if name not in coreSupportedProps and not allPropertyNames.has(name) 
            if allMethodNames.has(name)
                .sayErr "Ambiguity: A method named '#{name}' is already defined. Cannot reuse the symbol for a property"
                allMethodNames.get(name).sayErr "declaration of method '#{name}'"
            else if name in coreSupportedMethods
                .sayErr "'#{name}' is declared in as a core method. Cannot use the symbol for a property"
            else
                allPropertyNames.set name, this

### Append to class Grammar.VarDeclList ###

      method addToAllProperties
        for each varDecl in .list
            varDecl.nameDecl.addToAllProperties

      method getNames returns array of string
        var result=[]
        for each varDecl in .list
            result.push varDecl.name
        return result


### Append to class Grammar.VarStatement ###

'var' followed by a list of comma separated: var names and optional assignment

      method produce() 
        .out 'var ',{CSL:.list}

### Append to class Grammar.VariableDecl ###

variable name and optionally assign a value

      method produce
        .out .name,' = ', .assignedValue or 'undefined'


/*
      method produceAssignments(prefix) 

        var count=0

        for each variableDecl in .list
            if count++ and no prefix, .out ", "
            variableDecl.produceAssignment prefix
            if prefix, .out ";",NL

        if count and no prefix, .out ";",NL


/*
---
### Append to class Grammar.PropertiesDeclaration ###

'properties' followed by a list of comma separated: var names and optional assignment
See: Grammar.VariableDecl

      method produce() 

        //.outLinesAsComment .lineInx, .lastLineInxOf(.list)

        .out 'any ',{CSL:.list, freeForm:1},";"
        
        //for each inx,varDecl in .list
        //    .out inx>0?',':'',varDecl.name,NL

        .addToAllProperties

        .skipSemiColon = true


### Append to class Grammar.VariableDecl ###

variable name and optionally assign a value

      method produceAssignment(prefix) // prefix+name = [assignedValue|undefined]

            .out prefix, .name,' = '
            if .assignedValue
                .out .assignedValue 
            else
                .out 'undefined'

    end VariableDecl


### Append to class Grammar.VarStatement ###

'var' followed by a list of comma separated: var names and optional assignment

      method produceDeclare() 
        .out 'var ',{CSL:.list},";",NL

      method produce() 

'var' (alias for 'any') and one or more comma separated VariableDecl with assignments 

        .out 'var '
        .produceAssignments 
        .skipSemiColon = true

If 'var' was adjectivated 'export', add to exportNamespace

        /*
        if not .lexer.out.browser
  
              if .export and not .default
                .out ";", NL,{COMMENT:'export'},NL
                for each varDecl in .list
                    .out .lexer.out.exportNamespace,'.',varDecl.name,' = ', varDecl.name, ";", NL
                .skipSemiColon = true
        */
*/

### Append to class Grammar.ImportStatement ###

'import' followed by a list of comma separated: var names and optional assignment

      method produce() 

        //for each item in .list
        //    .out '#include "', item.getRefFilename('.h'),'"', NL

        .skipSemiColon = true


### Append to class Grammar.SingleLineBody ###

      method produce()
        
        var bare=[]
        for each item in .statements
            bare.push item.specific

        .out {CSL:bare, separator:";"},";"


### Append to class Grammar.IfStatement ###

      method produce() 

        declare valid .elseStatement.produce
        .conditional.produceType = 'Bool'
        .out "if (", .conditional,") "

        if .body instanceof Grammar.SingleLineBody
            .out '{',.body,'}'
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

`ForEachProperty: for each property [name-IDENTIFIER,]value-IDENTIFIER in this-VariableRef`

      method produce() 

=> C:  for(inx=0;inx<obj.getPropertyCount();inx++){ 
            value=obj.value.prop[inx]; name=obj.getPropName(inx); 
        ...

Create a default index var name if none was provided

        var listName, uniqueName = UniqueID.getVarName('list')  #unique temp listName var name
        declare valid .iterable.root.name.hasSideEffects
        if .iterable.operandCount>1 or .iterable.root.name.hasSideEffects or .iterable.root.name instanceof Grammar.Literal
            listName = uniqueName
            .out "any ",listName,"=",.iterable,";",NL
        else
            listName = .iterable

create a var holding object property count

        .out "len_t ",uniqueName,"_len=",listName,'.class->instanceSize / sizeof(any);' ,NL

        var startValue = "0"
        var intIndexVarName = '#{.mainVar.name}__inx';
        if .indexVar 
            .out "any ",.indexVar.name,"=undefined;",NL

        .out "any ",.mainVar.name,"=undefined;",NL

        .out 
            "for(int ", intIndexVarName,"=", startValue
            " ; ",intIndexVarName,"<",uniqueName,"_len"
            " ; ",intIndexVarName,"++){"

        .body.out .mainVar.name,"=",listName,".value.prop[",intIndexVarName,"];",NL
        
        if .indexVar 
            .body.out .indexVar.name,"= _getPropertyName(",listName,",",intIndexVarName,");",NL

        if .where 
          .out '  ',.where,"{",.body,"}"
        else 
          .out .body

        .out "};",{COMMENT:["end for each property in ",.iterable]},NL

### Append to class Grammar.ForEachInArray
### Variant 2) 'for each index' to loop over *Array indexes and items*

`ForEachInArray: for each [index-VariableDecl,]item-VariableDecl in array-VariableRef`

####  method produce()

Create a default index var name if none was provided

        var listName
        listName = UniqueID.getVarName('list')  #unique temp listName var name
        .out "any ",listName,"=",.iterable,";",NL

        if .isMap
            return .produceForMap(listName)

        var intIndexVarName
        var startValue = "0"
        if .indexVar 
            .indexVar.nameDecl.members.set '**proto**','**native number**'
            intIndexVarName = .indexVar.name
            startValue = .indexVar.assignedValue or "0"
        else
            intIndexVarName = '#{.mainVar.name}__inx';

include mainVar.name in a bracket block to contain scope

        .out "{ var ",.mainVar.name,"=undefined;",NL

        .out 
            "for(int ", intIndexVarName,"=", startValue
            " ; ",intIndexVarName,"<",listName,".value.arr->length"
            " ; ",intIndexVarName,"++){"

        .body.out .mainVar.name,"=ITEM(",intIndexVarName,",",listName,");",NL

        if .where 
            .out '  ',.where,"{",.body,"}" //filter condition
        else 
            .out .body

        .out "}};",{COMMENT:["end for each in ",.iterable]},NL


####  method produceForMap(listName)

        var intIndexVarName = "#{.mainVar.name}__inx" # unique map numeric index
        var nvp = UniqueID.getVarName('nvp') # pointer to name-value pair[inx]

        .out "{ NameValuePair_ptr ",nvp,"=NULL; //name:value pair",NL
        if .indexVar, .body.out " var ",.indexVar.name,"=undefined; //key",NL 
        .out " var ",.mainVar.name,"=undefined; //value",NL

        .out 
            "for(int64_t ",intIndexVarName,"=0"
            " ; ",intIndexVarName,"<",listName,".value.arr->length"
            " ; ",intIndexVarName,"++){",NL

        .body.out "assert(ITEM(",intIndexVarName,",",listName,").class==&NameValuePair_CLASSINFO);",NL
        
        .out nvp," = ITEM(",intIndexVarName,",",listName,").value.ptr;",NL //get nv pair
        if .indexVar, .body.out .indexVar.name,"=",nvp,"->name;",NL //get key
        .body.out .mainVar.name,"=",nvp,"->value;",NL //get value

        if .where 
          .out '  ',.where,"{",.body,"}" //filter condition
        else 
          .out .body

        .out "}};",{COMMENT:["end for each in map ",.iterable]},NL

### Append to class Grammar.ForIndexNumeric
### Variant 3) 'for index=...' to create *numeric loops* 

`ForIndexNumeric: for index-VariableDecl [","] (while|until|to|down to) end-Expression ["," increment-Statement] ["," where Expression]`

Examples: `for n=0 while n<10`, `for n=0 to 9`
Handle by using a js/C standard for(;;){} loop

      method produce(iterable)

        var isToDownTo: boolean
        var endTempVarName

        .endExpression.produceType='Number'

        // indicate .indexVar is a native number, so no ".value.number" required to produce a number
        .indexVar.nameDecl.members.set '**proto**','**native number**'

        if .indexVar.assignedValue, .indexVar.assignedValue.produceType='Number'

        if .conditionPrefix in['to','down']

            isToDownTo= true

store endExpression in a temp var. 
For loops "to/down to" evaluate end expresion only once

            endTempVarName = UniqueID.getVarName('end')
            .out "int64_t ",endTempVarName,"=",.endExpression,";",NL

        end if

        .out "for(int64_t ", .indexVar.name,"=", .indexVar.assignedValue or "0","; "

        if isToDownTo

            #'for n=0 to 10' -> for(n=0;n<=10;n++)
            #'for n=10 down to 0' -> for(n=10;n>=0;n--)
            .out .indexVar.name, .conditionPrefix is 'to'? "<=" else ">=", endTempVarName

        else # is while|until

produce the condition, negated if the prefix is 'until'

            #for n=0, while n<arr.length  -> for(n=0;n<arr.length;...
            #for n=0, until n >= arr.length  -> for(n=0;!(n>=arr.length);...
            .endExpression.produceType='Bool'
            .endExpression.produce( negated = .conditionPrefix is 'until' )

        end if

        .out "; "

if no increment specified, the default is indexVar++/--

        .out 
            .increment? .increment.specific else [.indexVar.name, .conditionPrefix is 'down'? '--' else '++'], ") " 
            "{" , .body, "};" 
            {COMMENT:"end for #{.indexVar.name}"}, NL



### Append to class Grammar.ForWhereFilter
### Helper for where filter
`ForWhereFilter: [where Expression]`

      method produce()
        .outLineAsComment .lineInx
        .filterExpression.produceType='Bool'
        .out 'if(',.filterExpression,')'

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

*options.askFor* is used when the source code was, for example,
`do until Expression` and we need to code: `while(!(Expression))` 
or the code was `loop while Expression` and we need to code: `if (!(Expression)) break` 

when you have a `until` condition, you need to negate the expression 
to produce a `while` condition. (`while NOT x` is equivalent to `until x`)

        .expr.produceType = 'Bool'
        .expr.produce(negated=negated)


### Append to class Grammar.DoLoop ###

      method produce() 

Note: **WhileUntilLoop** symbol has **DoLoop** as *prototype*, so this *.produce()* method
is used by both symbols.

        if .postWhileUntilExpression 

if we have a post-condition, for example: `do ... loop while x>0`, 

            .out 
                "do{", .getEOLComment()
                .body
                "} while ("
            
            .postWhileUntilExpression.produce(askFor='while')
            
            .out ")"

else, optional pre-condition:
  
        else

            .out 'while('
            if .preWhileUntilExpression
              .preWhileUntilExpression.produce(askFor='while')
            else 
              .out 'TRUE'

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
                break loop

            else if nodeASTBase is instanceof Grammar.ForStatement
                or nodeASTBase is instanceof Grammar.DoLoop
                    break loop //ok, break/continue used inside a loop

            end if

            nodeASTBase = nodeASTBase.parent

        loop

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

A `ArrayLiteral` is a definition of a list like `[1, a, 2+3]`. 
On js we just pass this through, on C we create the array on the fly

      method produce() 
      
        .out "new(Array,"

        if no .items or .items.length is 0
            .out "0,NULL"
        else
            .out .items.length, ',(any_arr){', {CSL:.items}, '}'
        
        .out ")"


### Append to class Grammar.NameValuePair ###

A `NameValuePair` is a single item in an Map definition. 
we call _newPair to create a new NameValuePair

      method produce() 
        var strName = .name

        if strName instanceof Grammar.Literal
            declare strName: Grammar.Literal
            strName = strName.getValue() 

        .out NL,'_newPair("',strName, '",', .value,')'

### Append to class Grammar.ObjectLiteral ### also FreeObjectLiteral

A `ObjectLiteral` is an object definition using key/value pairs like `{a:1,b:2}`. 
JavaScript supports this syntax, so we just pass it through. 
C99 does only support "static" initializers for structs.

      method produce()

        .out "new(Map,"

        if no .items or .items.length is 0
            .out "0,NULL"
        else
            .out 
                .items.length,',(any_arr){'
                {CSL:.items}
                NL,"}"
        
        .out ")",NL

### Append to class Grammar.ConstructorDeclaration ###

Produce a Constructor

      method produce() 

        if no .body.statements 
            .skipSemiColon=true
            return // just method declaration (interface)

        // get owner: should be ClassDeclaration
        var ownerClassDeclaration  = .getParent(Grammar.ClassDeclaration) 
        if no ownerClassDeclaration.nameDecl, return 

        var c = ownerClassDeclaration.nameDecl.getComposedName()

        .out "void ",c,"__init(DEFAULT_ARGUMENTS){",NL

auto call supper init

        if ownerClassDeclaration.varRefSuper
            .out 
                "  ",{COMMENT:"auto call super class __init"},NL
                "  ",ownerClassDeclaration.varRefSuper,"__init(this,argc,arguments);",NL

On the constructor, assign initial values for properties.
Initialize (non-undefined) properties with assigned values.

        .getParent(Grammar.ClassDeclaration).body.producePropertiesInitialValueAssignments "#{c}_"

// now the rest of the constructor body 

        .produceFunctionBody c


### Append to class Grammar.MethodDeclaration ###

Produce a Method

      method produce() 

        if no .body.statements
            .skipSemiColon=true
            return //just interface

        if no .nameDecl, return //shim
        var name = .nameDecl.getComposedName()

        var ownerNameDecl  = .nameDecl.parent
        if no ownerNameDecl, return 

        var isClass = ownerNameDecl.name is 'prototype'

        var c = ownerNameDecl.getComposedName()

        .out "any ",name,"(DEFAULT_ARGUMENTS){",NL

        //assert 'this' parameter class
        if isClass 
            .body.out 
                "assert(_instanceof(this,",c,"));",NL
                "//---------",NL 

        .produceFunctionBody c


### Append to class Grammar.FunctionDeclaration ###

only module function production
(methods & constructors handled above)

`FunctionDeclaration: '[export] function [name] '(' FunctionParameterDecl* ')' Block`

      method produce() 

exit if it is a *shim* method which never got declared (method exists, shim not required)

        if no .nameDecl, return

being a function, the only possible parent is a Module

        var parentModule = .getParent(Grammar.Module)
        var prefix = parentModule.fileInfo.base
        var name = "#{prefix}_#{.name}"

        var isInterface = no .body.statements
        if isInterface, return // just method declaration (interface)
        
        .out "any ",name,"(DEFAULT_ARGUMENTS){"

        .produceFunctionBody prefix


##### helper method produceFunctionBody(prefix:string)

common code
start body

        // function named params
        if .paramsDeclarations and .paramsDeclarations.length

                .body.out "// define named params",NL

                if .paramsDeclarations.length is 1
                    .body.out "var ",.paramsDeclarations[0].name,"= argc? arguments[0] : undefined;",NL

                else
                    var namedParams:array=[]

                    for each paramDecl in .paramsDeclarations
                        namedParams.push paramDecl.name

                    .body.out  
                        "var ",{CSL:namedParams},";",NL
                        namedParams.join("="),"=undefined;",NL
                        "switch(argc){",NL 
                        

                    for inx=namedParams.length-1, while inx>=0, inx--
                        .body.out "  case #{inx+1}:#{namedParams[inx]}=arguments[#{inx}];",NL
                    
                    .body.out "}",NL

                end if
                .body.out "//---------",NL
        
        end if //named params

if single line body, insert return. Example: `function square(x) = x*x`

        if .body instance of Grammar.Expression
            .out "return ", .body

        else

if it has a exception block, insert 'try{'

            if .hasExceptionBlock, .body.out " try{",NL

now produce function body

            .body.produce()

close the function, to all functions except *constructors* (__init), 
add default "return undefined", to emulate js behavior on C. 
if you dot not insert a "return", the C function will return garbage.

            if not .constructor is Grammar.ConstructorDeclaration // declared as void Class__init(...)
                .out "return undefined;",NL

close function

        .out "}"

        .skipSemiColon = true

        //if .lexer.out.sourceMap
        //    .lexer.out.sourceMap.add ( .EndFnLineNum, 0, .lexer.out.lineNum-1, 0)
        //endif


--------------------
### Append to class Grammar.PrintStatement ###
`print` is an alias for console.log

      method produce()

        if .args.length 
            .out 'print(#{.args.length},(any_arr){',{CSL:.args},'})'
        else
            .out 'print(0,NULL)'

--------------------
### Append to class Grammar.EndStatement ###

Marks the end of a block. It's just a comment for javascript

      method produce()

        declare valid .lexer.outCode.lastOriginalCodeComment
        declare valid .lexer.infoLines

        if .lexer.outCode.lastOriginalCodeComment<.lineInx
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

        method getRefFilename(ext)

            var thisModule = .getParent(Grammar.Module)

            return Environment.relativeFrom(thisModule.fileInfo.outDir,
                     .importedModule.fileInfo.outWithExtension(".h"))

--------------------
### Append to class Grammar.DeclareStatement ###

Out as comments

      method produce()
        .outLinesAsComment .lineInx, .names? .lastLineInxOf(.names) : .lineInx
        .skipSemiColon = true


----------------------------
### Append to class Names.Declaration ###
        //properties  
            //productionInfo: ClassProductionInfo

        method getComposedName

if this nameDecl is member of a namespace, goes up the parent chain
composing the name. e.g.: Foo_Bar_var

            var result = []
            var node = this
            while node and not node.isScope
                if node.name isnt 'prototype', result.unshift node.name
                if node.nodeDeclared instanceof Grammar.ImportStatementItem
                    //stop here, imported modules create a local var, but act as global var
                    //since all others import of the same name, return the same content 
                    return result.join('_')

                node = node.parent

if we reach module scope, (and not Global Scope) 
then it's a var|fn|class declared at module scope.
Since modules act as namespaces, we add module.fileinfo.base to the name.
Except is the same name as the top namespace|class (auto export default).


            if node and node.isScope and node.nodeDeclared.constructor is Grammar.Module 
                var scopeModule = node.nodeDeclared
                if scopeModule.name isnt '*Global Scope*' //except for global scope
                    if result[0] isnt scopeModule.fileInfo.base
                        result.unshift scopeModule.fileInfo.base

            return result.join('_')

For C production, we're declaring each distinct method name (verbs)

        method addToAllMethodNames() 
            var methodName=.name

            if methodName not in coreSupportedMethods and not allMethodNames.has(methodName) 
                if allPropertyNames.has(methodName)
                    .sayErr "Ambiguity: A property '#{methodName}' is already defined. Cannot reuse the symbol for a method."
                    allPropertyNames.get(methodName).sayErr "Definition of property '#{methodName}'."
                else if methodName in coreSupportedProps
                    .sayErr "Ambiguity: A property '#{methodName}' is defined in core. Cannot reuse the symbol for a method."

                else
                    allMethodNames.set methodName, this



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
we produce as chained if-else, using == to switchValue

        if .varRef

            var switchVar = UniqueID.getVarName('switch')
            .out "any ",switchVar,"=",.varRef,";",NL

            for each index,switchCase in .cases

                .outLineAsComment switchCase.lineInx

                .out 
                    index>0? 'else ' : '' 
                    'if (', {pre:'__is(#{switchVar},',CSL:switchCase.expressions, post:')', separator:'||'}
                    '){'
                    switchCase.body
                    NL
                    '}'

else, it's a swtich over true-expression, we produce as chained if-else
with the casee expresions

        else

          for each index,switchCase in .cases
              .outLineAsComment switchCase.lineInx
              .out 
                    index>0? 'else ' : '' 
                    'if (', {pre:'(', CSL:switchCase.expressions, post:')', separator:'||'}
                    '){'
                    switchCase.body, NL
                    '}'

        end if

defaul case

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

            var caseVar = UniqueID.getVarName('caseVar')
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


### Append to class Grammar.DebuggerStatement ###
      method produce
        .out "assert(0)"

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
                var functionAccess = varRef.accessors[inx]
                yieldArr = functionAccess.args
                inx--

            if inx>=0 
                if varRef.accessors[inx] isnt instance of Grammar.PropertyAccess
                    .throwError 'yield needs a clear method name. Example: "yield until obj.method(10)". redefine yield parameter.'

                fnName = "'#{varRef.accessors[inx].name}'"
                thisValue = [varRef.name]
                thisValue = thisValue.concat(varRef.accessors.slice(0,inx))


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

    var OPER_TRANSLATION_map = 

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
      return OPER_TRANSLATION_map.get(name) or name

---------------------------------

### Append to class ASTBase
Helper methods and properties, valid for all nodes

     properties skipSemiColon 

#### helper method assignIfUndefined(name,expression) 
          
          //.out "if(",name,'.class==&Undefined_CLASSINFO) ',name,"=",expression,";",NL
          .out "_default(&",name,",",expression,");",NL


--------------------------------
