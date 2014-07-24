LiteScript Compiler Source Version 2 
===

This .lite code is written in V1 SYNTAX, and when processed by V1 compiler,
will generate the V2 compiler, supporting V2 SYNTAX.

The V2 compiler will then be used to compile source-V3 (written in V2 SYNTAX)
to generate the V3 compiler.

V2 version major change is a re-written property validation module. 
See: "Validate.lite.md" and "NameDeclaration.lite.md"

Changes
-------

* Remove all "validation" code from the grammar, Added "NameValidate.lite", heavily enhanced
type guessing and property name validation.

* Remove ASTBase.reqValue() and optValue(). Now opt() and req(), when parameter is string, 
use parameter case to look for: type (upper case, e.g.:"IDENTIFIER") or value (lower case, e.g.:"return")

* simplify accessors. Grammar.Accessors is now abstract.

V2 SYNTAX
---------

* add "declare name affinity" for classes
* add "returns type-VariableRef" for functions, to enhance type-guess on vars assigned to function calls.
* add "obj hasnt property x" -> js: !(x in obj)

* remove 'pre AND post' do loop. Only pre OR post do-loops allowed (similar to js `while|do while`)
* remove 'bitwise' in favor of actual js bit operators: ~ & | 
* remove vestigial "method of xxx" in favor of "append to"

