## NOTES: namespace study 1.1

a namespace is just a namespace (no singleton)

namespaces can have internal classes and internal namespaces.
everything inside a namespace gets prepended #{namespaceName}_

*Special Considerations*: when producing, you must know if a var is a namespace

so process.config.value => process_config.value => PROP(value,process_config)

Classes cannot have other internal structures. 
A Class is not a namespace.

e.g.: "process"

    namespace process

        properties
            argv: array of string

        method exit
        method cwd

creates:

    var process_argv: array of string

    function process_exit
    function process_cwd


### S1.1 - Part I: Classes inside namespaces. e.g.: namespace fs


    namespace fs

      properties
          delimiter = '/'

      method statSync(filename)
      method readFileSync(filename)

      class Stat
        properties
          exists, size, atime, mtime
        method refresh
          .exists=false
          fsNative_refershStat(this)

creates:

    //namespace fs

        var fs_delimiter = '/';

        function fs_statSync(filename)
        function fs_readFileSync(filename)

        class fs_Stat
            properties
              exists, size, atime, mtime
            method refresh
              .exists=false
              fsNative_refershStat(this)

    //end namespace fs

so:

    new fs.Stat => new(fs_Stat)


### S1.1 - Part II: namespaces inside namespaces

    namespace Parser

      Class Lexer
          properties 
            filename, lineInx, sourceLineNum
          method nextToken

      Class Token
          properties 
            type, value, column
          method toString

      Class InfoLine
          properties 
            line
            tokens:array of Token
            sourceLineNum
          method tokenize

      namespace LineType
        properties
            BLANK=0
            CODE=1
            COMMENT=2

creates:

    //namespace Parser

        class Parser_Lexer

        class Parser_Token

        class Parser_InfoLine

        //namespace LineType

            var Parser_LineType_BLANK = 0
            var Parser_LineType_CODE = 1
            var Parser_LineType_COMMENT = 2
        
        //end namespace LineType

    //end namespace Parser


## NOTES: namespace study 1.0

a namespace is a singleton. 
a class is created automatically. 
Class name is [singleton]_class

namespaces can have internal classes and internal namespaces.
Classes cannot have other internal structures. 
A Class is not a namespace.

e.g.: "process"

    namespace process

        properties
            argv: array of string

        method exit
        method cwd

creates:

    class process_class
        properties
            argv: array of string
        method exit
        method cwd

    var process=new process_class


### S1.0 - Part I: Classes inside namespaces. e.g.: namespace fs


    namespace fs

      method statSync(filename)
      method readFileSync(filename)

      class Stat
        properties
          exists, size, atime, mtime
        method refresh
          .exists=false
          fsNative_refershStat(this)

creates:

    class fs_Stat
        properties
          exists, size, atime, mtime
        method refresh
          .exists=false
          fsNative_refershStat(this)

    class fs_class
        properties
            Stat = class fs_Stat
        method exit
        method cwd

    var fs=new fs_class

----


    class fs_class
        properties
            Stat = new Class 
                      properties
                        exists, size, atime, mtime
                      method refresh  //C-name: any fs_Stat_refresh()
                        .exists=false
                        fsNative_refreshStat(this)
        method exit
        method cwd

    var fs=new fs_class

so:

    new fs.Stat => new(PROP(Stat_,fs)) *where* PROP(Stat_,fs) returns type:Class


### S1.0 - Part II: namespaces inside namespaces

    namespace Parser

      Class Lexer
          properties 
            filename, lineInx, sourceLineNum
          method nextToken

      Class Token
          properties 
            type, value, column
          method toString

      Class InfoLine
          properties 
            line
            tokens:array of Token
            sourceLineNum
          method tokenize

      Namespace LineType
        properties
            BLANK=0
            CODE=1
            COMMENT=2

creates:

    class Parser_Lexer

    class Parser_Token

    class Parser_InfoLine

    class Parser_LineType_class
        properties
            BLANK=0
            CODE=1
            COMMENT=2

    class Parser_class
        properties 
            Lexer = class Parser_Lexer //class property
            Token = class Parser_Token //class property
            InfoLine = class Parser_Token //class property
            LineType = new Parser_LineType_class //singleton property


--------------------------------
## NOTES: namespace study 2 - if Classes could have properties

It wil be a mess. In the case of the actual code Lexer.lite.md  
Lexer is a Class, but it is used as namespace (by a trick with default export)
and this exported class/namespace Lexer includes class Token, InfoLine, Out
and the object-enum LineType.
"Lexer.lite.md" should be renamed "Parser.lite.md" and make "Parser" is a namespace,
then you have Parser.Lexer, Parser.Token, Parser.InfoLine, Parser.Out and Parser.LineType

a mess example:

    export default class Lexer
      ...

    append to namespace Lexer
        properties 
          LineType = new LineType_class

    namespace LineType
        properties
            BLANK=0
            CODE=1
            COMMENT=2

    Lexer.LineType.CODE  => 1

should create

    class Lexer_class_LineType_class
        properties
            BLANK=0
            CODE=1
            COMMENT=2

    class Lexer_class extend Class
        properties 
            LineType: Lexer_class_LineType_class

    class Lexer:Lexer_class
        ...

A MESS.





--------------------------------
## NOTES: super and prototype study

Objective: easy to translate to LiteC and JS

Notes: 
 -Classes can not be "called".
 -Classes have a property initInstance:Function 
 -"super" resolves to: any_class(this.class.super)
 
 - Classes have a pseudo-prop "prototype" to access methods
 - e.g.: Error.prototype.toString -> __classMethodFunc(toString,Error):Function

Examples:

    helper class ParseError extends Error
      constructor new ParseError(position, message)

--WITH .call

          super.initInstance.call this,"#{position} #{message}"

          Error.prototype.toString
          __classMethodFunc(toString,Error)

          Error.prototype.toString.call this,"#{position} #{message}"
          __classMethodFunc(toString,Error).call this,"#{position} #{message}"
          __apply(__classMethodFunc(toString,Error),this,1,(any_arr){"#{position} #{message}"});

          Error.initInstance.call
          PROP(initInstance,Error)
          Error.initInstance.call this,"#{position} #{message}"
          __apply(PROP(initInstance,Error),this, 1,(any_arr){"#{position} #{message}"});

--with .apply

          super.initInstance.apply this,arguments

          Error.prototype.toString
          __classMethodFunc(toString,Error)

          Error.prototype.toString.apply this,arguments
          __apply(__classMethodFunc(toString,Error),this,argc,arguments);

          Error.initInstance
          PROP(initInstance,Error)
          Error.initInstance.apply this,arguments
          __apply(PROP(initInstance,Error),this,argc,arguments);

JS........

    helper class ParseError extends Error
      constructor new ParseError(position, message)

          super.initInstance.call this,"#{position} #{message}"

          super.call(this,"#{position} #{message}");

          Error.call(this,"#{position} #{message}");


          super.initInstance.apply this,arguments
          Error.apply(this,arguments);


          Error.prototype.toString
          __classMethodFunc(toString,Error)

          Error.prototype.toString.call this,"#{position} #{message}"
          __apply(__classMethodFunc(toString,Error),2,(any_arr){this,"#{position} #{message}"});

          Error.__init
          PROP(__init,Error)
          Error.__init.call this,"#{position} #{message}"
          __apply(PROP(__init,Error),2,(any_arr){this,"#{position} #{message}"});



    helper class SyntaxError extends Error
      constructor new SyntaxError(position, message)
          super.constructor "#{position} #{message}"

