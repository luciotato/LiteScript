ScriptyC is a javascriptey-way to write C
-------------------------------------

It is useful when:
    - you need to translate node.js javascript code to C for performance

Why:
    LiteScript Compiler uses it as an target lang, in order to be
    able to generate javascript and C from the same source

##Design Goal

Create a lang that is easily translatable from LiteScript (also javascript)
into a fast C source.

##Constraints
In order to generate a fast C source, LiteScript (also javascript) needs to 
be limited. Most of the dynamic features should be avoided.

##Biases

1) Since I'll reuse LiteScript PEG Compiler, most syntax/structure choices come from there.
2) Since it's javascript inspired and oriented, implementation designs (like prototypal
inheritance) come from javascript

##Some Constraints details

Navigating the proto-chain is slow. Also, storing properties in the
prototype is prone to bugs. The only thing on the prototype should be methods.

To be fast we'll make all methods calls from the proto stucture itself. 
All properties exists in each instance even from inherited classes, but the
methods are in the proto, so we need to differentiate property access from method call.

As in js, we're using pointers but avoiding pointer arithmetic.

"." is used to access properties (translates to C's "->")
"call" is used to call a method, 
e.g. "PROP ACCESS"
         js: "foo.bar.prop = 1;" 
=> ScriptyC: "foo.bar.prop = 1" 
=>        C: "foo->bar->prop=1;" 

e.g. "SIMPLE CALL"
         js: "foo(10, bar(1));" 
=> ScriptyC: "call foo(10, call bar 1)" 
       => C: "foo(10,bar(1));" 

e.g. "METHOD CALL"
         js: "foo.bar.zz(10,1);" 
=> ScriptyC: "call on foo.bar zz(10,1)" 
       => C: "foo->bar->CALL->zz(foo->bar,10,1);" 

e.g. "METHOD CALL + PA"
         js: "console.log(foo.bar.zz(10,1).length);" 
=> ScriptyC: "call console log(call foo.bar zz(10,1).length)" 
       => C: "console->proto->log(console, foo->bar->proto->zz(foo->bar,10,1)->length)" 

**KEEP IN MIND the objective of the lang: translate normalized js code into a *fast* C source.**

Other ScriptyC CHANGES from a C's point of view
-----------------------------------------------

  in var declarations name precedes type (vs. C's type precedes name)

 "var" is used to declare variables, type follows var name, with a ":"
    e.g.:  "var a:int" equals C's "int a;"

 "returns" after a function header, defines function return type
    e.g.:  "function fn() returns int" equals C's "int function fn();"

 {} are replaced by indents, as in Python

 ";" is not required, NEWLINE ends a statement

 NEWLINE act as comma in comma separated lists (as in LiteScript)

 "end" act as comment and can be used to close any block

 . is pointer-dereference (C's "->")

 \ is struct member access (C's ".")

 "struct Xx" means "struct Xx{...} + typedef (struct Xx *) Xx"
    so defining a "struct X" means defining also X as type: "pointer to struct X"

  all "struct" names are CamelCased
  default usage for all CamelCased names is then: "pointer to struct"
  e.g.: ASTBase is a pointer to "struct ASTBase"

 "struct Foo extends Bar" means "struct Foo starts whit all members in struct Bar". 
 "struct Foo { +Bar+ , ..}" means the same as above

 "try-catch" and "GC" libs are automatically included

 "pointer.member = function(...){}" means: declare function pointer_member(...){}
 and then assign to pointer.member

NOT YET:
-unicode aware
-"namespace Xx" defines the name to use for anonymous functions when generating C code

### ScriptyC code

    #define false 0
    #define true 1
    #define bool int

type str is a pointer to inmutable strings

    typedef const char* str

forward decls
-------------

    forward struct Object;
    typedef (struct Object *) Object;
    forward struct Class;
    typedef (struct Class *) Class;

common object header
--------------------

def MACRO OJB_HEADER METHODS

---
Object

    //Object methods
    instanced struct Object__METHODS 
        toString: function(this:Object)
            return "[#{this.class.name}]"

    //properties
    struct Object CALL=Object__METHODS
        class : Class   //que tipo de objeto es (int)
        CALL  : #{CALL}  //ptr to single struct with all METHODS for this class
        //-----

    // la info es redundante y permite saber si un puntero apunta a un objeto valido. 
    // Si (ptr.CALL is __type.CALL) entonces es un objeto valido
    
    //init Fn
    //none
    
---
Class

    //properties
    struct Class
        +Object+ CALL=Object__METHODS
        name         : str        // class name
        __init       : function*  // executable initialization code
        instanceSize : size_t     // size de la struct que crea
        methods      : void*      // address of CALL struct with all methods
        super        : Class      // super class 

    //init Fn
    function Class__init(this:Class, 
            name:str
            initFn:function*
            instanceSize : size_t
            methods:void* 
            super:Class 
            )
                .name = name 
                .initFn = initFn
                .instanceSize = instanceSize
                .methods = methods
                .super = super
    end function

---

manually instantiate Object__CLASS info

    var Object__CLASS: struct Class;

    with Object__CLASS
        \class = Class__CLASS // type of this object
        \CALL = Object__METHODS_instance //methods of this object
        //-------------
        \name = 'Object'
        \__init = null
        \instanceSize = sizeOf(struct Object)
        \methods = Object__METHODS_instance
        \super = null

manually instantiate Class__CLASS class info

    var Class__CLASS: struct Class;

    with Class__CLASS
        \class = Class__CLASS // ptr to itself
        \CALL = Object__METHODS_instance
        //-------------
        \name = 'Class'
        \__init = Class_init
        \instanceSize = sizeOf(Class)
        \methods = Object__METHODS_instance
        \super = Object_CLASS

---
__GLOSS (GLobal claSS Registry)
a single linked list with all registered classes
    
    struct __GLOSS_item
        classInfo: Class 
        next: __GLOSS_item

    struct __GLOSS_List
        head: __GLOSS_item
        tail: __GLOSS_item

    var firstItem: struct __GLOSS_item
    var secondItem: struct __GLOSS_item

    firstItem\classInfo = Class_CLASS
    firstItem\next = secondItem

    secondItem\classInfo = Object_CLASS
    secondItem\next = null

    var __GLOSS: struct __GLOSS_List
    __GLOSS\head = firstItem
    __GLOSS\tail = secondItem

---------
Helper functions

    function new( classInfo:Class ) returns Object
        // use info at classInfo to allocate memory space. set type & constructor
        Object o = alloc(classInfo.instanceSize)
        o.class = classInfo // class of this instance
        o.CALL = classInfo.methods // address of CALL struct with all methods
        return o
    
Register Class helper:  registers a new class

    function __registerClass(
             name: str
             super: Class  //proto class ID. Which class this class extends
             initFn: function* 
             methods: void*
             instanceSize: size_t 
             ) 
                returns Class

        //create class info
        var newClassInfo = new(Class__CLASS)
        call Class_init newClassInfo, name, initFn, instanceSize, methods, super

        // add to __GLOSS list
        var newItem:__GLOSS_item = alloc(sizeof(struct __GLOSS_item))
        newItem.classInfo = newClassInfo
        newItem.next = null
        __GLOSS\tail.next = newItem //link to last
        __GLOSS\tail = newItem //move last

        return newClassInfo //returns registered ClassInfo
    
    end function

------------
class String

    forward struct String__METHODS;

    //properties
    struct String
        +Object+ CALL=String__METHODS
        //---
        length : int         // in bytes
        value  : str         // inmutable char* value
    
    //init Fn
    function String__init( this:String, value:str){
        //auto call super__init, to initialize first part of space at *this
        // none for super=Object
        // specific init
        this.value = value
        this.length = strlen(value)

    //methods
    method struct String__METHODS

        +Object__METHODS+ //copy prt list of super's Methods

        indexOf : function(searched:string, fromIndex:int=0) returns int
            var sl:size_t = searched.length;
            for(start=fromIndex; start< .length-sl; start++)
                if memcmp(this.value[start],searched,sl) is 0
                    return start;
            return -1
            
        slice : function(start:int, end:int=-1) returns str

            len = .length

            start = inRange( 0, start<0?len+start:start , len)

            end = inRange( 0, end<0?len+end:end , len)

            if start>=end, return ''

            newstr = alloc(size+1)
            memcpy(newstr, this.value[start], size)
            newstr[size]='\0'

            return newstr

    //register CLASS
    String_CLASS = call __registerClass 
        'String', Object__CLASS
        String__init
        String__METHODS
        sizeof(struct String) //created type & size
        

-----
    
### "new"
cuando en lite o js, se hace: a = new ASTBase(10)
se codifica como:  a = ASTBase__CLASS.__init(new(ASTBase__CLASS), 10)
Dado esto, no se puede llamar a una Function-Class sin "new"
por ejemplo: a = ASTBase(5) se codificaria
a = ASTBase(5) y falla p q ASTBase es un struct* y no una fn

### pase como parametro:
cuando en lite o js, se pasa una function-class como parametro, se usa el mismo nombre
por ej: var statement:ASTBase = .req(LoopStatement,ForStatement)
al pasarlo hay que pasar el __CLASS
ASTBase statement = .req(LoopStatement__CLASS,ForStatement__CLASS)

en resumen, cuando la clase Foo se usa como parametro o con "new",
se translitera como: "Foo__CLASS"

TO DO:
----------
-register all "boxed" scalars in GOR

----------
ASTBase

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
    
    ASTBase_CLASS = __registerClass ( 
        TYPE_ASTBase ,'ASTBase'
        Object_CLASS  //proto class. Which class this class extends
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

    end function

    var ASTBase__CLASS = __registerClass ( 
            TYPE_ASTBase ,'ASTBase'
            ,Object_Class  //proto class. Which class this class extends
            ,ASTBase__init
            ,sizeof(struct ASTBase)) //created type & size

-register on __GLOSS

    __registerClass ( TYPE_ASTBase, sizeof(struct ASTBase)
            , Object__proto
            , 'ASTBase', ASTBase__constructor, 3 )

-declare other methods & store at class

    ASTBase__proto.lock = function (ASTBase this)
        this.locked = true


-------------

    struct Statement
        +ASTBase+
        bool global,shim,export
        ASTBase specific

declare __init executable code
-- SI NO EXISTE, se crea un default que TIENE LOS MISMOS PARAMS que SUPER, y llama a SUPER
-- luego inicializa las propiedades con los valores default

//-declare init executable code
 a "__init" function: 
    a) calls super-class __init in order to init initial fields of the struct
    b) initializes all own members to its default values
    
    function Statement__init( this:Statement
                parent: ASTBase 
                name: str )
    
        //auto call proto ctors, to initialize first part of mem space at *this
        ASTBase__init(this, parent, name)
        //init vars to default values
        with this
            assign false to .bool, .global
            assign null to .specific
        //specific user-declared init
    end function

    var Statement__CLASS = __registerClass ( TYPE_Statement ,'Statement'
        ASTBase_Class  //proto class. Which class this class extends
        Statement__init
        sizeof(struct Statement)) //created size


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