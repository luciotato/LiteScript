LiteScript Compiler Source v0.7
===============================

This .lite code is written in v0.6 SYNTAX, and when processed by v0.6 compiler,
will generate the v0.7 compiler, supporting v0.7 SYNTAX. 

v0.7 compiler introduces a lot of new syntax and breaking changes, 
in order to compile v0.8 which is able to compile to C. 
v0.7, by introducing breaking changes, may not be able to compile itself.

v0.7 should be compiled by v0.6 and the used to compile v0.8

##IMPORTANT: development is made at /devel/source-v0.7

If you're reading /source/, it's just a snapshot of the last release.
Do NOT work on /source/, work on /devel/source-v0.7

v0.7 
----

## MAIN CHANGES

### added:

#### arguments.toArray()

var x = arguments.toArray()  
=> js:
  var x = Array.prototype.slice.call(arguments)

#### named function arguments. see Grammar.FunctionArgument

#### Lexer option literal map

### Breaking changes

#### for each [own] property name[,value] in obj

  - to support a unified syntax to compile-to-C and JS, syntax change.
  - new syntax: `for each property [name,]value in obj`

  translations:

        => js: for(name in obj) if obj.hasOwnProperty(name){ value=obj[name]; ...}

        => C:  for(inx=0;inx<obj.getPropertyCount();inx++){ value=obj.value.prop[inx]; name=obj.getPropName(inx); ...}
 
  Changes explained: 
    - [own] optional is now default.
    - a single "index var" means "value", two index vars means "name,value" 
      (the same logic behind `for each in array`)


### Removed:

#### "namespace properties" inside a class
  - reason: confusing
  - replacement: add "append to namespace xx" after the class xx declaration




##TO DO:

#### requirement to a valid c-conversion

- not supported yet:
    - untyped vars
    - Regexp
    - JSON
    - append to namespace

