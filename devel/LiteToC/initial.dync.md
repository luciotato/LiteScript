DynC is a javascriptey-way to write C
-------------------------------------

It is useful when:
    - you need to translate node.js javascript code to C for performance

Why:
    LiteScript Compiler uses it as an target lang, in order to be
    able to generate javascript and C from the same source

DynC CHANGES over C
-------------------

 {} are replaced by indents, as in Python
 ";" is not required, NEWLINE ends a statement
 NEWLINE act as comma in comma separated lists (as in LiteScript)
 "end" act as comment and can be used to close any block

  in var declarations name precedes type (vs. C's type precedes name)

 "var" is used to declare variables, type follows var name, with a ":"
    e.g.:  "var a:int" equals C's "int a;"

 "returns" after a function header, defines function return type
    e.g.:  "function fn() returns int" equals C's "int function fn();"


 . is pointer-dereference (C's "->")

 \ is struct member access (C's ".")

 "struct Xx" means "struct Xx{...} + typedef (struct Xx *) Xx"
    so defining a "struct X" means defining also X as type: "pointer to struct X"

  all "struct" names are CamelCased
  default usage for all CamelCased names is then: "pointer to struct"
  e.g.: ASTBase is a pointer to "struct ASTBase"

 "struct Foo extends Bar{...}" means "struct Foo starts whit all members in struct Bar". 
 "struct Foo {+Bar+, ..}" same as above

 "with" syntax construction added

 "try-catch" and "GC" libs are automatically included

 pointer.member = function(...){} means: declare function pointer_member(...){}
 and then assign to pointer.member

NOT YET:
-unicode aware
-"namespace Xx" defines the name to use for anonymous functions when generating C code

### Dyn C code

    enum TYPE_ID 
        TYPE_UNDEFINED = 1
        TYPE_BOOLEAN
        TYPE_INT32
        TYPE_UINT32
        TYPE_INT64
        TYPE_UINT64
        TYPE_DOUBLE
        TYPE_STRING
        TYPE_OBJECT_PTR
        TYPE_ARRAY_PTR
        TYPE_FUNCTION_PTR

        TYPE_Object
        TYPE_Function
        _START_USER_DEFINED_TYPES
        //
        //
        _START_DYN_CLASSES_START_TYPES
    
    end enum

    var __dynClass_typeID = _DYN_CLASSES_START_TYPES

    #define false 0
    #define true 1
    #define bool int

type str is a pointer to inmutable strings

    typedef (const char)* str

"method" is a pointer to a function(Object this,...)

    typedef (function(Object this))* method
    
    struct Object 
        __type   : TYPE_ID        //que tipo de objeto es (int)
        class    : struct Class*  //ptr to struct Class, also Class-ID
        // la info es redundante y permite saber si un puntero apunta a un objeto valido. 
        // Si (constructor == __GLOSS[__type]) es un objeto valido
        __proto__  : struct Class*  // ptr to proto class
    

    struct Class 
        +Object+
        name    :  str        //class name
        __init  : function*   //executable initialization code
        created__type : TYPE_ID     //Own index at __GLOSS. Used when accessed from a pointer
        created__size : size_t      // size de la struct que crea
    

    struct Function
        +Object+
        name       :str         //function name
        call       :function*   //executable
        length     :int         //arity
    

    struct String
        +Object+
        length : int         //in unicode points
        value  : str         // inmutable char* value
    

    #define var Object

GLOSS = GLObal claSS registry
-----------------------------

Holds all class definitions

    const __GLOSS_length:int = _DYN_CLASSES_START_TYPES + 100; //  extra space for 100 dyn created classes

    var __GLOSS: array [0 .. __GLOSS_length ] of struct Class 

---
__registerClass registers class info in __GLOSS[]

    function __registerClass(
             type: TYPE_ID
             name: str
             protoClass: Class  //proto class. Which class this class extends
             initFn: function* 
             createdSize: size_t 
             ) 
                returns Class

        with __GLOSS[type] // store at __GLOSS[type]
        //as Object data
            \__type = TYPE_Class //all objects in __GLOSS are Classes
            \constructor = __GLOSS[TYPE_Class] // instance.constructor.constructor -> always a Class
            \__proto__ = protoClass //proto class. Which class this class extends
        //as Class data
            \name = name
            \__init = initFn       // creator fn
            \created_type = type   //Own index at __GLOSS. Used when accessed from a pointer
            \created_size = size   //allocated size in memory
    
        return &(__GLOSS[createdType]) //returns registered "struct Class" 
    
    end function

--------

    function Object__init( this: Object, protoClassInx: TYPE_ID )
        this.__proto__ = &__GLOSS[protoClassInx] //set proto class, get from __GLOSS
    
    var Object__CLASS = __registerClass( 
            TYPE_Object ,'Object'
            null //proto class. Which class this class extends
            Object__init
            sizeof(struct Object)) //created size

---------

    function Class__init( this: Class ) 
        //auto call proto ctors, to initialize first part of space at *this
        Object__init(this,TYPE_Class)
        // specific init
        // Class__init does nothing specific
        // because all class info is pre-registered in __GLOSS[]
    
    var Class__CLASS = __registerClass( 
            TYPE_Class ,'Class'
            ,Object_Class  //proto class. Which class this class extends
            ,Class__init
            ,sizeof(struct Class)) //created type & size

---------

    function Function__init(this: Function)
        throw 'cant dynamically create functions' 

    var Function__CLASS = __registerClass ( 
        TYPE_Function ,'Function'
        Object_Class  //proto class. Which class this class extends
        Function__init
        sizeof(struct Function) ) //created type & size

---------

    function String__init( this:this, value:str){
        //auto call proto ctors, to initialize first part of space at *this
        Object__init(this,TYPE_String)
        // specific init
        this.value = value

    var String__CLASS = __registerClass ( 
        TYPE_String ,'String'
        ,Object_Class  //proto class. Which class this class extends
        ,String__init
        ,sizeof(struct String)) //created type & size

----------------------------
Helper functions

    function __allocType( type:TYPE_ID ) returns Object

        // use info at __GLOSS[type] to allocate memory space. set type & constructor
        Object o = alloc(__GLOSS[type]\__size)
        o.__type = type //type code
        o.constructor = __GLOSS[type] //Class (redundant - allows validation of Object pointers)
        return o
    
    function __alloc ( cl:Class ) returns Object
        return __allocType(cl.created__type) //allocate space for created type
    
### "new"
cuando en lite o js, se hace: a = new ASTBase(10)
se codifica como:  a = ASTBase__CLASS.__init(__alloc(ASTBase__CLASS), 10)
Dado esto, no se puede llamar a una Function-Class sin "new"
por ejemplo: a = ASTBase(5) se codificaria
 a = ASTBase__CLASS(5) y falla p q __CLASS is not a function


### pase como parametro:
cuando en lite o js, se pasa una function-class como parametro, se usa el mismo nombre
por ej: var statement:ASTBase = .req(LoopStatement,ForStatement)
al pasarlo hay que pasar el __CLASS
ASTBase statement = .req(LoopStatement__CLASS,ForStatement__CLASS)

en resumen, cuando la clase Foo se usa como parametro o con "new",
se translitera como: "Foo__CLASS"

    // to dynamically construct new classes
    function __registerNewClass(
            name:str, initFn: function* 
            protoClass: Class 
            created__size: size_t ) 
    
        if __dynClass_typeID is __GLOSS_length //no more space
            throw 'no more space for dynamically created classes. Extend __GLOSS_length'

        TYPE_ID type = __dynClass_typeID++
        return  __registerClass ( type , name
                    protoClass //proto class. Which class this class extends
                    initFn, created__size) 
    end function


TO DO:
----------
-register all "boxed" scalars in GOR

----------

    struct ASTBase 
        +Object+
        parent: Object  
        name: str
        keyword:str
        type:str
        itemType:str
        lexer: Lexer   
        lineInx: int
        sourceLineNum: int
        column: int
        indent: int
        locked: bool
        index: int
    
    __registerClass ( TYPE_ASTBase ,'ASTBase'
        Class_Class  //proto class. Which class this class extends
        ASTBase__init
        sizeof(struct ASTBase)) //created size

//-declare init executable code
 a "__init" function: 
    a) calls super-class __init in order to init initial fields of the struct
    b) initializes all own members to its default values
    
    function ASTBase__init( this:ASTBase 
                parent: ASTBase 
                name: str )
    
        //auto call proto ctors, to initialize first part of mem space at *this
        Class__init(this, TYPE_ASTBase)
        //init vars to default values
        with this
            assign null to .parent, .lexer
            assign "" to .name, .keyword, .type, .itemType
            assign 0 to .lineInx, .sourceLineNum, .column, .indent, .locked, .index
        //specific user-declared init

        this.parent = parent
        this.name = name

        this.lexer = parent.lexer

        if this.lexer 
            this.sourceLineNum = this.lexer.sourceLineNum
            this.column = this.lexer.token.column
            this.indent = this.lexer.indent
            this.lineInx = this.lexer.lineInx    
        end if

-register on __GLOSS

    reg__GLOSS ( TYPE_ASTBase, sizeof(struct ASTBase)
            , Object__proto
            , 'ASTBase', ASTBase__constructor, 3 )

example: call stm lock
C: stm->class->lock();

-declare other methods & store at class

    ASTBase__proto.lock = function (ASTBase this)
        this.locked = true



    struct Statement
        +ASTBase+
        bool global,shim,export
        str keyword
        ASTBase specific

declare __init executable code
-- SI NO EXISTE, se crea un default que TIENE LOS MISMOS PARAMS que SUPER, y llama a SUPER
-- luego inicializa las propiedades con los valores default

    Statement__init = ASTBase__init

#### helper method getParent(searchedClass)
**getParent** method searchs up the AST tree until a specfied node class is found
    
    ASTBase__proto.getParent = function(ASTBase this, var searchedClass)

        var node = this.parent
        while(node && !(isInstanceof(node,searchedClass)){
            node = node.parent // move to parent
        }
        return node;


#### helper method positionText() returns string

    ASTBase__proto.positionText = function(ASTBase this) returns str
        if (!(this.lexer || !this.sourceLineNum)) {return "(compiler-defined)"};
        //return this.lexer.filename + ":" + this.sourceLineNum + ":" + (this.column||0)
        return strConcat(this.lexer.filename, ":" , this.sourceLineNum , ":" , intToString(this.column||0))

#### helper method toString()

    ASTBase__proto.toString = function(ASTBase this) returns str
        return strConcat("[",this.constructor.name,"]");

#### method throwError(msg)
**throwError** add node position info and throws a 'controled' error.

A 'controled' error, shows only err.message

A 'un-controled' error is an unhandled exception in the compiler code itself, 
and it shows error message *and stack trace*.

    ASTBase__proto.throwError = function(ASTBase this, str msg)
        // var err = new CompilerError(...
        var err = new__CompilerError( strConcat("", this.positionText(),". ",msg) );
        err.controled = true
        throw err

#### helper method sayErr(msg)

    ASTBase__proto.sayErr = function( ASTBase this, msg)
        log.error( this.positionText(), msg );

#### Method opt() returns ASTBase

    ASTBase__proto.opt = function( ASTBase this, Array arguments)

        var startPos = this.lexer.getPos()

        #debug
        int spaces = this.levelIndent()

For each argument, -a class or a string-, we will attempt to parse the token stream 
with the class, or match the token type to the string.

        //for each searched in arguments
        var searched;
        for(int inx=0;inx<arguments.length;inx++){ 
            searched=arguments[inx];

            if (!searched){continue;}

            if isTypeOf(searched,'string'){
                bool isTYPE = isAllUPPER(searched);
                bool found

                if (isTYPE)
                  //found = .lexer.token.type is searched 
                  // a is b - string comparision -> strcmp
                  found = (strcmp(this.lexer.token.type,searched)==0)
                else
                  //found = .lexer.token.value is searched 
                  found = (strcmp(this.lexer.token.value,searched)==0)

            if(found)

              //debug spaces, .constructor.name,'TRY',searched.name, 'on', .lexer.token.toString()
              // las llamadas con varargs, se convierten en una llam
              debug(ARGS(5,
                , spaces, TYPE_Int
                , this.constructor.name, TYPE_String
                , 'matched OK:', TYPE_String
                , searched, , TYPE_String
                , this.lexer.token.value, TYPE_String ))

              str result = this.lexer.token.value;

Advance a token, .lexer.token always has next token

              this.lexer.nextToken()
              return result

          else

"searched" is an AST class

            //debug spaces, .constructor.name,'TRY',searched.name, 'on', .lexer.token.toString()
            debug(ARGS(...

if the argument is an AST node class, we instantiate the class and try the `parse()` method.
`parse()` can fail with `ParseFailed` if the syntax do not match

            try


        ASTBase this = __new(TYPE_ASTBase);
        return ASTBase__constructor(this,parent,name);



                //var astNode:ASTBase = new searched(this) # create required ASTNode, to try parse

                ASTBase astNode = __new(searched.__type);
                return ASTBase__constructor(this,parent,name);

                ASTBase astNode = new searched(this) # create required ASTNode, to try parse

                #if there was adjectives on the parent, apply as properties
                # so they're available during parse
                declare valid .adjectives:array
                if .adjectives 
                    for each adj in .adjectives
                        declare valid adj.name
                        astNode[adj.name]=true

                astNode.parse() # if it can't parse, will raise an exception

                debug spaces, 'Parsed OK!->',searched.name

                return astNode # parsed ok!, return instance

            catch err

If parsing fail, but the AST node were not 'locked' on target, (a soft-error),
we will try other AST nodes.

              if err.soft
                  .lexer.softError = err
                  debug spaces, searched.name,'parse failed.',err.message

rewind the token stream, to try other AST nodes

                  debug "<<REW to", "#{startPos.sourceLineNum}:#{startPos.token.column or 0} [#{startPos.index}]", startPos.token.toString()
                  .lexer.setPos startPos

              else

else: it's a hard-error. The AST node were locked-on-target.
We abort parsing and throw.

                  # debug

                  # the first hard-error is the most informative, the others are cascading ones
                  if .lexer.hardError is null 
                      .lexer.hardError = err
                  #end if

raise up, abort parsing

                  raise err

              #end if - type of error

            #end catch
            
          #end if - string or class

        #loop - try the next argument

No more arguments.
`opt` returns `undefined` if none of the arguments could be use to parse the stream.

        return undefined

      #end method opt



#### method req() returns ASTBase

**req** (required) if for required symbols of the grammar. It works the same way as `opt` 
except that it throws an error if none of the arguments can be used to parse the stream.

We first call `opt` to see what we get. If a value is returned, the function was successful,
so we just return the node that `opt` found.

else, If `opt` returned nothing, we give the user a useful error.

    ASTBase__proto.req = function( ASTBase this, Array arguments)

        var result = .opt.apply(this,arguments)

        if no result 
          .throwParseFailed "#{.constructor.name}: found #{.lexer.token.toString()} but #{.listArgs(arguments)} required"

        return result